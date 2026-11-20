# TP Unidad 9 – Seguridad (Backend)

**Alumno:** Mauro Zavatti – Programación IV (TUPaD / UTN)

API REST con **FastAPI + SQLModel + PostgreSQL**, arquitectura **Router → Service → Unit of Work → Repository** (del TP8), a la que se le agrega **autenticación con JWT en cookie HttpOnly** y **autorización por roles** (`admin` / `user`).

---

## Cómo ejecutarlo

### 1. Base de datos
Crear en PostgreSQL (pgAdmin) una base vacía llamada **`tp_seguridad`**. Las tablas se crean solas al iniciar la API, y `app/core/seed.py` carga los catálogos y dos usuarios:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `juan` | `Juan1234!` | user |

### 2. Variables de entorno
```powershell
copy .env.example .env
```
Completar en `.env`:
- `DATABASE_URL`: la contraseña de PostgreSQL.
- `SECRET_KEY`: una clave aleatoria de al menos 32 caracteres. Generarla con:
  ```powershell
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

El `.env` **no se entrega** (está en `.gitignore`). Si falta `SECRET_KEY` o es muy corta, la API **no arranca** (fail-fast).

### 3. Instalar y correr (puerto 8000)
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Documentación interactiva: http://localhost:8000/docs (botón **Authorize** para loguearse).

### 4. Pruebas con REST Client (VS Code)
REST Client guarda la cookie del login y la reenvía sola, igual que el navegador.

Con la base recién creada (o después de vaciarla y **reiniciar uvicorn** para que el seed vuelva a crear los usuarios):
```sql
TRUNCATE historial_estados_pedido, detalles_pedido, pedidos,
         producto_categoria, producto_ingrediente, productos,
         categorias, ingredientes, usuarios
RESTART IDENTITY CASCADE;
```
Ejecutar **en este orden**:

| Archivo | Contenido |
|---|---|
| `auth.http` | Registro, login, logout, `/me`, permisos 401/403, panel de admin y cuenta desactivada |
| `catalogo.http` | Categorías, productos, ingredientes y unidades (logueado como admin) |
| `pedidos.http` | Pedidos como admin y, en la sección J, como `juan` (pedidos propios y permisos) |

Se respeta ese orden porque `auth.http` empieza probando las rutas **sin sesión** (401), y los otros dos dejan guardada la cookie de admin.

---

## Seguridad implementada

### Contraseñas
- Hash con **bcrypt** (`passlib`). En la base solo se guarda `hashed_password` (`$2b$12$...`), nunca la contraseña.
- Si el usuario no existe, igual se verifica contra un hash de prueba, para que el tiempo de respuesta no revele qué usuarios existen.
- Máximo 72 bytes de contraseña (límite de bcrypt), validado en el schema.

### JWT en cookie HttpOnly
- `POST /auth/token` recibe el formulario OAuth2 (`username`, `password`) y devuelve el token en una cookie **`access_token`** con `httponly=True` y `samesite="lax"` (`secure` se configura con `COOKIE_SECURE`, `True` en producción con HTTPS).
- El token (HS256) lleva `sub` (username), `role`, `type` y `exp` (30 minutos).
- JavaScript **no puede leer** la cookie, así que un ataque XSS no puede robar el token.
- `POST /auth/logout` borra la cookie con `Set-Cookie`.

### Cadena de dependencias (`app/core/deps.py`)
```
OAuth2PasswordBearerWithCookie  → lee el token de la cookie
        ↓
get_current_user                → decodifica el JWT y busca el usuario   (401)
        ↓
get_current_active_user         → rechaza cuentas desactivadas            (400)
        ↓
require_role("admin")           → verifica el rol                         (403)
```
- `OAuth2PasswordBearerWithCookie` es una subclase de `OAuth2PasswordBearer`: Swagger sigue mostrando el botón Authorize, pero el token se lee **solo de la cookie** (un header `Authorization` se ignora).
- El rol se lee de la **base de datos**, no del token: si un admin desactiva a un usuario o le cambia el rol, aplica en la siguiente request aunque su token siga vigente.
- Atajos con `Annotated`: `CurrentUser`, `AdminUser` (para recibir el usuario como parámetro) y `SoloAutenticado`, `SoloAdmin` (para `dependencies=[...]`).

### Configuración (`app/core/config.py`)
`pydantic-settings` lee el `.env`. `DATABASE_URL` y `SECRET_KEY` son `SecretStr`: si se imprime `settings` aparecen como `'**********'`, y solo se leen con `.get_secret_value()`.

### CORS
Solo `http://localhost:5173`, con `allow_credentials=True` (necesario para que el navegador mande la cookie).

---

## Endpoints de autenticación (`/api/v1/auth`)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/register` | Público | Crea un usuario con rol **siempre** `user` (201). Duplicado → 409 |
| POST | `/token` | Público | Login. Credenciales incorrectas → 401; cuenta desactivada → 400 |
| POST | `/logout` | Público | Borra la cookie |
| GET | `/me` | Autenticado | Datos del usuario logueado |
| GET | `/admin/usuarios` | Admin | Lista de usuarios |
| POST | `/admin/usuarios/{id}/activar` | Admin | Reactiva una cuenta |
| POST | `/admin/usuarios/{id}/desactivar` | Admin | Desactiva una cuenta (soft delete con `disabled`) |

## Permisos del resto de la API
| Recurso | Leer (GET) | Escribir (POST / PUT / DELETE) |
|---|---|---|
| Categorías, productos, ingredientes | Autenticado | **Admin** (user → 403) |
| Unidades de medida, estados, formas de pago | Autenticado | — (solo lectura) |
| Pedidos | Autenticado (user: solo los propios) | Crear y editar detalles: autenticado. Cambiar estado y eliminar: **Admin** |
| Health | Público | — |

Sin cookie o con un token inválido/vencido → **401**.

---

## Estructura agregada respecto del TP8
```
app/
├── core/
│   ├── config.py      Settings (pydantic-settings, SecretStr)
│   ├── security.py    hash/verify de contraseñas y crear/decodificar JWT
│   ├── deps.py        cookie → usuario → activo → rol
│   └── exceptions.py  + BadRequestError (400) y UnauthorizedError (401)
└── modules/
    └── usuarios/      models · schemas · repository · service · router
```

## Decisiones
1. **Prefijo `/api/v1` en todas las rutas**, no solo en `/auth`, para que la API tenga una única base.
2. **Pedidos con dueño:** `pedidos.usuario_id` pasó a ser una FK obligatoria a `usuarios` y se toma del usuario logueado (ya no viene en el body). Un `user` solo ve sus pedidos; el pedido de otro le responde **404** (no 403, para no revelar que existe). El admin ve todos.
3. **El admin no puede desactivarse a sí mismo** (409), para no quedarse sin acceso.
4. **Base separada `tp_seguridad`**, para no mezclar datos con el TP8.
5. **Versiones fijas** `bcrypt==4.0.1` y `passlib==1.7.4`: las versiones nuevas de bcrypt no son compatibles con passlib.
