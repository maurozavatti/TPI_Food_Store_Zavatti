# TP Unidad 10 – Arquitectura por features (Frontend)

**Alumno:** Mauro Zavatti – Programación IV (TUPaD / UTN)

Refactorización del frontend del TP9 a una **arquitectura basada en features**. Stack: React + TypeScript + Vite + Tailwind 4, TanStack (Query, Form, Table), React Router, Axios y Zustand.
El backend es el mismo del TP9, sin cambios (JWT en cookie HttpOnly).

---

## Cómo ejecutarlo

Con el backend del TP9 corriendo en `http://localhost:8000`:

```powershell
pnpm install
pnpm dev
```

Abrir http://localhost:5173 (sin sesión redirige a `/login`).

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `juan` | `Juan1234!` | user |

---

## Estructura de carpetas

```
src/
├── features/                    ← una carpeta por funcionalidad del negocio
│   ├── auth/
│   │   ├── components/          RoleBadge
│   │   ├── hooks/               useAuth, useRegister, useUsers
│   │   ├── pages/               LoginPage, RegisterPage, AdminUsersPage
│   │   ├── services/            authService, usersService (llamadas Axios)
│   │   ├── store/               authStore (Zustand, SIN persist)
│   │   ├── types/               auth.types (Rol, AuthStatus, Usuario...)
│   │   └── index.ts             barrel: API pública de la feature
│   ├── categories/
│   │   ├── components/          CategoriaModal
│   │   ├── hooks/               useCategories
│   │   ├── pages/               CategoriesPage
│   │   ├── services/            categoriesService
│   │   ├── types/               categoria
│   │   └── index.ts
│   ├── products/
│   │   ├── components/          ProductoModal
│   │   ├── hooks/               useProducts
│   │   ├── pages/               ProductsPage
│   │   ├── services/            productsService
│   │   ├── types/               producto
│   │   └── index.ts
│   └── ingredients/
│       ├── components/          IngredienteModal
│       ├── hooks/               useIngredients, useUnidadesMedida
│       ├── pages/               IngredientsPage
│       ├── services/            ingredientsService, unidadesService
│       ├── types/               ingrediente, unidadMedida
│       └── index.ts
├── shared/                      ← lo que usan varias features
│   ├── api/
│   │   ├── api.ts               instancia de Axios (withCredentials)
│   │   ├── setupInterceptors.ts interceptor de respuesta 401 / 403
│   │   ├── handleApiError.ts    traduce errores a mensajes legibles
│   │   └── queryClient.ts       QueryClient único
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── UnauthorizedPage.tsx
│   │   ├── Toast.tsx
│   │   ├── DataTable.tsx
│   │   └── ui/                  Button, Modal, ErrorBanner, FieldInfo, styles
│   └── types/api.ts             PaginatedResponse<T>
├── store/                       ← estado global de INTERFAZ
│   ├── themeStore.ts            modo oscuro (con persist)
│   └── notificationStore.ts     mensaje del Toast
├── routes/
│   ├── AppRouter.tsx            todas las rutas
│   └── ProtectedRoute.tsx       control de sesión y rol
├── App.tsx                      checkAuth + <AppRouter/> + <Toast/>
├── main.tsx                     providers + importa setupInterceptors
└── index.css                    Tailwind + variante dark
```

### Qué va en cada carpeta

| Carpeta | Contenido | Regla |
|---|---|---|
| `features/<x>/` | Todo lo de una funcionalidad: pantallas, componentes, hooks, servicios y tipos | Si se borra la carpeta, desaparece la funcionalidad completa |
| `features/<x>/index.ts` | **Barrel**: exporta lo que otras partes pueden usar | Desde afuera se importa **solo** del barrel |
| `shared/` | Código que no pertenece a ninguna feature (Axios, Navbar, Toast, botones) | No contiene lógica de negocio |
| `store/` | Estado global de interfaz (tema, notificaciones) | El estado de sesión vive en `features/auth/store` |
| `routes/` | Declaración de rutas y protección | Las rutas se declaran solo en `AppRouter` |

---

## Reglas de importación

1. **Alias `@/`** = `src/`. Está configurado en los dos lugares:
   - `vite.config.ts` → `resolve.alias: { '@': path.resolve(import.meta.dirname, 'src') }`
   - `tsconfig.app.json` → `"paths": { "@/*": ["./src/*"] }`
2. **Dentro de una feature** se usan rutas relativas (`../hooks/useCategories`).
3. **Entre features** solo a través del barrel:
   ```ts
   import { useAuth } from '@/features/auth'                         // ✔
   import { useCategories } from '@/features/categories'             // ✔ (ProductsPage)
   import { useAuthStore } from '@/features/auth/store/authStore'    // ✘ prohibido
   ```
4. **Lo compartido** con el alias: `@/shared/...`, `@/store/...`, `@/routes/...`.

Ejemplo real: `ProductsPage` necesita las categorías, los ingredientes y las unidades para el formulario; los toma con `useCategories()`, `useIngredients()` y `useUnidadesMedida()` importados desde los barrels de esas features.

---

## Rutas y protección

| Ruta | Acceso |
|---|---|
| `/login`, `/register`, `/unauthorized` | Públicas |
| `/categories`, `/products`, `/ingredients` | Cualquier usuario autenticado |
| `/admin/users` | Solo `admin` (`allowedRoles={['admin']}`) |

`ProtectedRoute` funciona como ruta padre:

1. `status === 'checking'` → muestra un indicador de carga (todavía se está consultando `/auth/me`).
2. `status === 'unauthenticated'` → `<Navigate to="/login" replace state={{ from }} />`.
3. Con sesión pero sin el rol → `/unauthorized`.
4. Todo OK → `<Outlet />` (dibuja la ruta hija).

### Errores HTTP (`shared/api/setupInterceptors.ts`)

- **401** (excepto en `/auth/token` y `/auth/me`): `clearSession()` limpia el usuario y la caché → `ProtectedRoute` manda a `/login` con el aviso "Tu sesión venció".
- **403**: muestra la notificación **"Acceso denegado"**. **No** cierra la sesión ni redirige.

El interceptor está en un archivo aparte (y no en `api.ts`) para evitar un import circular: `authStore → authService → api → authStore`. Se importa **una sola vez** en `main.tsx`.

---

## Estado

### Sesión – `features/auth/store/authStore.ts`
- **Sin `persist`** (RA-09): la sesión **nunca** se guarda en `localStorage` ni en `sessionStorage`. El token está solo en la cookie HttpOnly, que JavaScript no puede leer.
- `status: 'checking' | 'authenticated' | 'unauthenticated'`.
- Al recargar la página, `App` llama a `checkAuth()` → `GET /auth/me` con la cookie → recupera el usuario.

### Interfaz – `store/`
- `themeStore`: `darkMode` + `toggleTheme`, **con `persist`** (`name: 'theme-storage'`). El botón 🌙/☀️ está en el Navbar. La clase `dark` se aplica a `<html>` y Tailwind la usa con `@custom-variant dark (&:where(.dark, .dark *));`.
- `notificationStore`: `message`, `show`, `type`, `showNotification`, `hideNotification`.
- `Toast` está montado una sola vez en `App` y se oculta solo a los **3 segundos** (`setTimeout` en un `useEffect`, con `clearTimeout` en el cleanup).

---

## Hooks por feature

Las páginas **no usan Axios ni TanStack Query directamente**: todo pasa por los hooks.

| Hook | Encapsula | Notifica |
|---|---|---|
| `useAuth` | Lectura del store, `login`, `logout` (+ navegación), `isAdmin`, `hasRole` | Bienvenida y cierre de sesión |
| `useRegister` | `useMutation` del registro | Cuenta creada |
| `useUsers` | `useQuery` de usuarios + activar / desactivar | Éxito y error |
| `useCategories` | `useQuery` + crear / actualizar / eliminar | Éxito y error |
| `useProducts` | `useQuery` + crear / actualizar / eliminar | Éxito y error |
| `useIngredients` | `useQuery` + crear / actualizar / eliminar | Éxito y error |
| `useUnidadesMedida` | `useQuery` del catálogo de unidades (`staleTime: Infinity`) | – |

Cada hook devuelve los datos listos (`categorias`, `total`, `isLoading`, `error`) y las mutaciones (`crear`, `actualizar`, `eliminar`). La página solo maneja estado de interfaz (modal abierto, fila seleccionada).

`App.tsx` queda mínimo:

```tsx
const App = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth)
  useEffect(() => { checkAuth() }, [checkAuth])
  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}
```
