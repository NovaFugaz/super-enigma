# Sonido Vivo — Tienda online

Aplicación de e-commerce y gestión interna para **Sonido Vivo**, tienda de instrumentos y equipos musicales de Viña del Mar. Proyecto de la asignatura Desarrollo Fullstack II (DSY1104).

El proyecto incluye un frontend **React + Vite + Tailwind CSS** y una API **Spring Boot + MySQL**. El login/registro y el catálogo usan la API local; el carrito, los pedidos y los paneles de gestión todavía conservan flujos de demostración en el navegador. El pago es simulado.

---

## Tecnologías

| Área | Tecnología |
| --- | --- |
| UI | React 19, React Router 7 |
| Build | Vite 8 |
| API | Spring Boot, Java 21 |
| Persistencia | MySQL 8.4 + Spring Data JPA |
| Autenticación | JWT Bearer |
| Estilos | Tailwind CSS 4 |
| Mapa | Leaflet + react-leaflet |
| Catálogo | REST API (`GET /api/products`) |
| Calidad | Vitest + Testing Library, oxlint |

---

## Instalación y ejecución local

### Requisitos

- Docker Desktop con Docker Compose
- **Node.js 22.22 o superior** y npm

### Pasos

Desde `backend/sonidoVivo`, iniciar MySQL y el backend:

```powershell
docker compose up --build
```

La API queda en `http://localhost:8080`; Swagger en `http://localhost:8080/swagger-ui.html`. Compose publica MySQL en el puerto `3307`. Para detener los servicios, ejecutar `docker compose down` desde la misma carpeta.

En otra terminal, desde `frontend`:

```powershell
npm install
npm run dev
```

Vite muestra la URL del frontend (por defecto <http://localhost:5173>). El cliente usa `http://localhost:8080` como API predeterminada; se puede cambiar con `VITE_API_URL`. Si cambias el origen del frontend, actualiza `CORS_ALLOWED_ORIGINS` y `FRONTEND_URL` en Docker Compose para que los enlaces de recuperación apunten a la dirección correcta.

> El repo incluye `package-lock.json` y `pnpm-lock.yaml`. Con npm se usa el primero; si prefieres pnpm, usa `pnpm install`.

## Usuarios de prueba

Cuentas demo creadas por el backend en MySQL al iniciar Docker Compose.

| Rol | Correo | Contraseña | Entra a |
| --- | --- | --- | --- |
| Cliente | `cliente@sonidovivo.cl` | `Cliente123!` | `/pedidos` |
| Vendedor | `vendedor@sonidovivo.cl` | `Vendedor123!` | `/vendedor` |
| Administrador | `admin@sonidovivo.cl` | `Admin123!` | `/administracion` |

También puedes **registrarte** desde `/registro` (se crea siempre con rol *Cliente*; la contraseña debe tener mínimo 8 caracteres). Para recuperar contraseña, solicita un enlace en `/recuperar`; en local, abre la bandeja de Mailpit en <http://localhost:8025>.

Los pedidos de demostración que se precargaban en el prototipo anterior no se crean en la API. La compra y los paneles de pedidos siguen pendientes de integración y no comparten sus datos con MySQL.

---

## Vistas

### Públicas

| Ruta | Vista |
| --- | --- |
| `/` | Inicio: categorías y productos destacados |
| `/catalogo` | Catálogo con búsqueda, filtro por categoría y orden (precio / nombre) |
| `/producto/:codigo` | Detalle del producto con precio y estado de stock (disponible, bajo, agotado) |
| `/carrito` | Carrito, despacho o retiro, y pago simulado |
| `/seguimiento` | Consulta de pedido por número de pedido o de seguimiento (stepper de estados) |
| `/nosotros` | Quiénes somos |
| `/contacto` | Contacto y mapa interactivo (tienda y puntos de retiro) |
| `/login` · `/registro` · `/recuperar` | Autenticación |
| `/403` | Acceso denegado (simulado) |

### Por rol (rutas protegidas)

| Ruta | Rol | Contenido |
| --- | --- | --- |
| `/pedidos` | Cliente | Historial de sus propios pedidos y estado |
| `/vendedor` | Vendedor | **Inventario:** tabla con búsqueda, filtros, alerta de stock bajo (umbral configurable) y edición de stock. **Pedidos:** búsqueda, cambio de estado con transiciones válidas y registro de auditoría. |
| `/administracion` | Administrador | **Dashboard:** KPIs, ventas por fecha, productos top, filtro por período y exportación a CSV. **Usuarios y roles:** crear, editar, desactivar y asignar rol. **Productos:** crear, editar y desactivar. **Inventario:** control de stock |

Un usuario sin sesión que entra a una ruta protegida va a `/login`; con sesión pero sin el rol correcto, va a `/403`.

---

## Flujo de compra y reglas de negocio

1. El cliente agrega productos al carrito (no puede superar el stock disponible).
2. Elige **despacho a domicilio** (pide dirección) o **retiro en punto** (Starken o Chilexpress).
3. Paga con la **pasarela simulada**: hay un botón de pago aprobado y otro de pago rechazado para probar ambos casos. Solo los clientes con sesión pueden pagar.
4. Si se aprueba, se crea el pedido (boleta electrónica simulada), se descuenta el stock y el pedido queda en estado `pendiente`.

- Los precios del catálogo **incluyen IVA (19 %)**; el desglose se calcula al mostrar el total.
- Despacho a domicilio: **$4.990**, gratis desde **$150.000**. El retiro no tiene costo.
- Estados de pedido y transiciones permitidas:

```text
pendiente → en_proceso → validado → enviado → entregado
    └──────────┴────────────┴──→ rechazado
```

Cada cambio de estado queda en el log de auditoría del pedido (quién, qué y cuándo) y dispara una notificación simulada dentro de la app.

---

## Estructura del proyecto

```text
super-enigma/
├── documentacion/              # Documentación del proyecto (ERS)
├── frontend/
│   ├── public/
│   │   └── catalogo.xlsx       # Archivo Excel del prototipo anterior
│   ├── src/
│   │   ├── __tests__/          # Pruebas unitarias (Vitest)
│   │   ├── assets/             # Imágenes y logos
│   │   ├── components/
│   │   │   ├── cart/           # CartItem, CartSidebar
│   │   │   ├── catalog/        # ProductCard, CategoryCard, StockBadge
│   │   │   ├── common/         # FormField, PasswordField, StoreMap, EmptyState...
│   │   │   └── layout/         # Header, Navbar, Footer, MainLayout, Newsletter
│   │   ├── context/            # AuthContext, CartContext, CatalogContext
│   │   ├── data/               # catalog.js (catálogo de respaldo)
│   │   ├── hooks/              # useAuth, useCart, useCatalog
│   │   ├── modules/            # Una carpeta por dominio
│   │   │   ├── about/
│   │   │   ├── admin/          # Panel de administración
│   │   │   ├── auth/           # Login, registro, recuperar, 403
│   │   │   ├── cart/           # Carrito, pedidos, seguimiento
│   │   │   ├── catalog/        # Inicio, catálogo, detalle
│   │   │   ├── contact/        # Contacto y mapa
│   │   │   └── seller/         # Panel de vendedor
│   │   ├── routes/             # AppRouter y ProtectedRoute (RBAC)
│   │   ├── services/           # Mocks: auth, pedidos, catálogo xlsx, ubicaciones, reportes
│   │   ├── styles/             # Tailwind y estilos globales
│   │   ├── test/               # Setup de pruebas
│   │   ├── utils/              # Cálculo de carrito, formato de moneda
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Persistencia actual

La API persiste usuarios, catálogo y tokens de restablecimiento en MySQL. El correo se captura localmente en Mailpit (SMTP `localhost:1025`, interfaz web `localhost:8025`), sin enviarlo fuera de tu equipo. La sesión JWT se conserva en `sessionStorage` por defecto o en `localStorage` al seleccionar “Recordarme”. El carrito y las operaciones aún no integradas persisten en el navegador:

| Clave | Contenido |
| --- | --- |
| `sonido-vivo-session` | Sesión activa con perfil y JWT (`sessionStorage` o `localStorage`) |
| `sonido-vivo-cart` | Carrito |
| `sonido-vivo-orders` | Pedidos de demostración (aún no conectados a la API) |
| `sonido-vivo-stock` | Stock de demostración modificado desde los paneles locales |
| `sonido-vivo-product-overrides` | Cambios locales de productos de demostración |
| `sonido-vivo-low-stock-threshold` | Umbral de stock bajo del panel local |

---

## Pruebas

```bash
npm test
```

Cubren rutas protegidas, autenticación, integración HTTP/JWT, pedidos y transiciones de estado, datos de administración y reportes. El parser Excel se conserva para pruebas del prototipo anterior.

---

## Estado y limitaciones de integración

- Login y registro usan Spring Boot; el backend aplica JWT y control de acceso por rol.
- El catálogo visible se carga desde la API. Si no está disponible, se muestra un error en lugar de sustituirlo silenciosamente por datos locales.
- La compra, el historial y seguimiento de pedidos, los cambios de inventario, la administración y los reportes todavía usan datos/servicios locales y deben conectarse a sus endpoints antes de considerar completa la integración.
- La recuperación usa enlaces de un solo uso, con vencimiento de 15 minutos. En este proyecto local, los correos se revisan en Mailpit.
- El pago es simulado; no se conecta a pasarelas ni bancos reales.
- La aplicación está pensada para ejecutarse localmente con Docker Compose; no se ha desplegado en un servicio externo.

---