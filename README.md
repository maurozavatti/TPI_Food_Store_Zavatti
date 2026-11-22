# Food Store — Trabajo Práctico Integrador

**Programación IV · Tecnicatura Universitaria en Programación a Distancia (UTN)**
**Alumno:** Mauro Zavatti

Sistema de pedidos de comida: catálogo público con carrito, compra con sesión iniciada, seguimiento de pedidos y panel de administración (productos, categorías, pedidos, usuarios y resumen del negocio).

- 🔗 **Repositorio:** https://github.com/maurozavatti/TPI_Food_Store_Zavatti
- 🎥 **Video de demostración:** https://youtu.be/SC-0Cz2gVB0

---

## Tecnologías

| Capa | Stack |
|---|---|
| Backend | Python 3.11–3.13 · FastAPI · SQLModel (SQLAlchemy 2) · PostgreSQL (psycopg2) · JWT en cookie HttpOnly (python-jose) · bcrypt (passlib) |
| Frontend | React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · TanStack Query / Form / Table · Zustand · React Router · Axios |

## Requisitos previos

- **Python 3.11, 3.12 o 3.13** (SQLModel todavía no es compatible con 3.14).
- **Node.js 20.19 o superior** (recomendado 22 LTS) y **pnpm** (`npm install -g pnpm`).
- **PostgreSQL 14 o superior**, con una base de datos vacía creada (por ejemplo `foodstore_db`).

---

## 1. Backend

```bash
cd backend

# Entorno virtual
python -m venv .venv
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

pip install -r requirements.txt

# Variables de entorno: copiar el ejemplo y completar
# Windows: copy .env.example .env      Linux/macOS: cp .env.example .env

# Carga inicial (crea las tablas, el admin, categorías y productos). Es idempotente.
python -m app.db.seed

# Levantar la API
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs

### Variables de entorno del backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:TU_PASSWORD@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave para firmar los JWT (mínimo 32 caracteres) | generar con `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

> Alternativa sin PostgreSQL (solo desarrollo): `DATABASE_URL=sqlite:///./foodstore.db`.

## 2. Frontend

En otra terminal, con el backend corriendo:

```bash
cd frontend

# Variables de entorno: copiar el ejemplo
# Windows: copy .env.example .env      Linux/macOS: cp .env.example .env

pnpm install
pnpm build   # verifica los tipos (tsc) y genera la versión de producción
pnpm dev
```

- Aplicación: http://localhost:5173

### Variables de entorno del frontend (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## Usuarios del seed

| Rol | Usuario | Contraseña |
|---|---|---|
| **Administrador** | `admin` | `Admin1234!` |
| Cliente de prueba | `juan` | `Juan1234!` |

El seed también carga **4 categorías** (Pizzas, Hamburguesas, Empanadas, Bebidas) y **12 productos** con stock.
Cualquier persona puede registrarse desde `/register`; las cuentas nuevas tienen rol `user`.

---

## Funcionalidades

**Público:** catálogo paginado en el servidor, búsqueda por nombre, filtro por categoría y carrito persistente (sobrevive a la recarga).

**Cliente (con sesión):** checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas; "Mis pedidos" con detalle y cancelación mientras el pedido está PENDIENTE (devuelve el stock).

**Administrador:** resumen del negocio (pedidos de hoy, ingresos, cantidad por estado); ABM de categorías y productos (con cambio rápido de stock y disponibilidad); gestión de pedidos con la máquina de estados; activación y desactivación de usuarios.

### Reglas de negocio implementadas

| Regla | Implementación |
|---|---|
| RN-01 Crear pedido | Valida producto activo, disponible y con stock; descuenta stock; copia nombre y precio; calcula el total. Todo en **una transacción** (si un ítem falla, no se guarda nada). |
| RN-02 Transiciones | `PENDIENTE → EN_PREPARACION → ENTREGADO`; `PENDIENTE` y `EN_PREPARACION → CANCELADO`. `ENTREGADO` y `CANCELADO` son terminales (400). |
| RN-03 Cancelación | Restituye el stock de cada línea en la misma transacción. |
| RN-04 Permisos | El cliente ve y cancela solo sus pedidos (403 si es ajeno); el admin ve todos y cambia estados. |
| RN-05 Inmutabilidad | Las líneas guardan nombre y precio del momento de la compra; los pedidos no se editan ni se borran. |
| RN-06 Datos del pedido | `forma_pago` ∈ {EFECTIVO, TRANSFERENCIA}; dirección de 5 a 200 caracteres. |

---

## Arquitectura

### Backend: módulos por dominio + Unit of Work

```
backend/app/
├── core/              config, database, security, deps, unit_of_work (base), base_repository (genérico)
├── db/seed.py         carga inicial idempotente
├── modules/
│   ├── auth/          router, service, schemas            (usa el modelo Usuario)
│   ├── usuarios/      models, schemas, repository, unit_of_work, service, router
│   ├── categorias/    ídem
│   ├── productos/     ídem
│   └── pedidos/       ídem (Pedido + DetallePedido)
├── models.py          registra los 5 modelos de tabla
└── main.py            app, CORS, routers bajo /api/v1
```

- **Router → Service → Unit of Work → Repository.** El Router solo traduce HTTP y obtiene el Service con `Depends(get_<modulo>_service)`; el Service tiene las reglas de negocio y abre la transacción con `with self.uow as uow:`; los Repository solo acceden a datos (nunca hacen commit).
- **Unit of Work:** `__exit__` hace `commit` si no hubo error y `rollback` si lo hubo. Cada módulo hereda el UoW base y expone sus repositorios sobre la misma sesión (por ejemplo, `PedidoUnitOfWork` tiene `pedidos` y `productos`, así el pedido y el descuento de stock son atómicos).
- **Errores de dominio:** los Services lanzan excepciones propias (`StockInsuficiente`, `TransicionInvalida`, `PedidoAjeno`…) y el Router las traduce a 400 / 403 / 404 / 409.
- **Seguridad:** contraseñas con bcrypt; JWT en cookie **HttpOnly** (el frontend nunca lee el token); `require_role` protege las rutas de admin.

### Frontend: organización por features

```
frontend/src/
├── features/
│   ├── auth/          api, hooks (useAuth, useRegister), pages (Login, Register, Unauthorized), types
│   ├── categorias/    api, hooks (useCategorias), components, pages (AdminCategoriasPage), types
│   ├── productos/     api, hooks (useProductos), components (ProductoCard, formularios), pages (Catalogo, AdminProductos), types
│   ├── usuarios/      api, hooks (useUsuarios), pages (AdminUsuariosPage), types
│   └── pedidos/       api, hooks (usePedidos, useCrearPedido, useCancelarPedido, useCambiarEstadoPedido, useResumenPedidos),
│                      components, pages (Carrito, Checkout, MisPedidos, AdminPedidos, AdminResumen), types
├── shared/
│   ├── api/           axiosInstance (withCredentials), interceptor 401/403, QueryClient
│   ├── ui/            Button, Card, Input, Modal, BadgeEstado
│   ├── components/    DataTable, Paginacion, Skeleton, EstadoVacio, EstadoError, Toast
│   └── layout/        Navbar, MainLayout
├── store/             authStore (persist solo del usuario), cartStore (persist), notificationStore, themeStore
├── routes/            AppRouter (BrowserRouter + tabla de rutas), ProtectedRoute (sesión y rol)
├── App.tsx            checkSession() al montar + rutas + Toast
└── main.tsx           QueryClientProvider
```

- **Estado del servidor** (productos, pedidos, categorías, usuarios) con **TanStack Query**: caché por `queryKey`, invalidación después de cada mutación, paginación del lado del servidor.
- **Estado del cliente** con **Zustand**: carrito (persistente), sesión (persiste solo el usuario, nunca el token), notificaciones y tema.
- Cada feature expone su API pública en un `index.ts` (barrel); entre features se importa solo desde ahí. Alias `@/` = `src/`.

---

## Endpoints principales (`/api/v1`)

| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` · `/auth/token` · `/auth/logout` | Público |
| GET | `/auth/me` | Sesión |
| GET | `/categorias` · `/categorias/{id}` | Público |
| POST · PUT · DELETE | `/categorias` · `/categorias/{id}` | Admin |
| GET | `/productos?skip&limit&search&categoria_id&disponible` · `/productos/{id}` | Público |
| POST · PUT · PATCH · DELETE | `/productos` · `/productos/{id}` · `/productos/{id}/stock` | Admin |
| POST · GET | `/pedidos` · `/pedidos/{id}` | Sesión (propios) / Admin (todos) |
| PATCH | `/pedidos/{id}/cancelar` | Dueño (solo PENDIENTE) |
| PATCH | `/pedidos/{id}/estado` | Admin |
| GET | `/pedidos/resumen` | Admin |
| GET · POST | `/admin/usuarios` · `/admin/usuarios/{id}/activar` · `/admin/usuarios/{id}/desactivar` | Admin |

La documentación completa, con los schemas de entrada y salida, está en http://localhost:8000/docs.
