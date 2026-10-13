# Sonido Vivo — Prototipo Frontend

Prototipo funcional (Fase 1) de e-commerce y gestión interna para **Sonido Vivo**, tienda de instrumentos y equipos musicales de Viña del Mar. Proyecto de la asignatura Desarrollo Fullstack II (DSY1104).

Es un frontend **React + Vite + Tailwind CSS** sin backend: los datos viven en `localStorage`, el catálogo se carga desde un archivo Excel y el pago es simulado. La estructura modular deja el proyecto listo para integrar más adelante una API REST (Spring Boot) y MySQL.

---

## Tecnologías

| Área | Tecnología |
| --- | --- |
| UI | React 19, React Router 7 |
| Build | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Mapa | Leaflet + react-leaflet |
| Catálogo | `read-excel-file` (lee `public/catalogo.xlsx`) |
| Calidad | Vitest + Testing Library, oxlint |

---

## Instalación y ejecución

### Requisitos

- **Node.js 22.22 o superior** (ver `engines` de las dependencias en `package-lock.json`)
- npm (incluido con Node)

### Pasos

```bash
1. Clonar el repositorio
- git clone https://github.com/<usuario>/super-enigma.git
- cd super-enigma/frontend

2. Instalar dependencias
- npm install

3. Levantar el servidor de desarrollo
- npm run dev
```

Abre la URL que muestra la terminal (por defecto <http://localhost:5173>).

> El repo incluye `package-lock.json` y `pnpm-lock.yaml`. Con npm se usa el primero; si prefieres pnpm, usa `pnpm install`.

## Usuarios de prueba (mock)

Cuentas demo para probar las funcionalidades.

| Rol | Correo | Contraseña | Entra a |
| --- | --- | --- | --- |
| Cliente | `cliente@sonidovivo.cl` | `Cliente123!` | `/pedidos` |
| Vendedor | `vendedor@sonidovivo.cl` | `Vendedor123!` | `/vendedor` |
| Administrador | `admin@sonidovivo.cl` | `Admin123!` | `/administracion` |

También puedes **registrarte** desde `/registro` (se crea siempre con rol *Cliente*; la contraseña debe tener mínimo 8 caracteres) y **recuperar contraseña** desde `/recuperar`. El administrador puede crear usuarios con cualquier rol, editarlos y desactivarlos (un usuario desactivado no puede iniciar sesión).

### Pedidos de demostración

Al iniciar se precargan 6 pedidos del cliente demo, uno por cada estado, útiles para probar el seguimiento y los paneles:

| Pedido | Seguimiento | Estado |
| --- | --- | --- |
| `SV-DEMO-1001` | `TRK-DEMO-1001` | pendiente |
| `SV-DEMO-1002` | `TRK-DEMO-1002` | en_proceso |
| `SV-DEMO-1003` | `TRK-DEMO-1003` | validado |
| `SV-DEMO-1004` | `TRK-DEMO-1004` | enviado |
| `SV-DEMO-1005` | `TRK-DEMO-1005` | entregado (retiro en tienda) |
| `SV-DEMO-1006` | `TRK-DEMO-1006` | rechazado |

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
| `/vendedor` | Vendedor | **Inventario:** tabla con búsqueda, filtros, alerta de stock bajo (umbral configurable) y edición de stock. **Pedidos:** búsqueda, cambio de estado con transiciones válidas y registro de auditoría. Pensado para pantallas móviles (≥ 360 px) |
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
│   │   └── catalogo.xlsx       # Catálogo inicial (50 productos)
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

## Persistencia de datos

Todo se guarda en el navegador (`localStorage`/`sessionStorage`):

| Clave | Contenido |
| --- | --- |
| `sonido-vivo-users` | Cuentas de usuario |
| `sonido-vivo-session` | Sesión activa (`sessionStorage`, o `localStorage`) |
| `sonido-vivo-cart` | Carrito |
| `sonido-vivo-orders` | Pedidos y auditoría |
| `sonido-vivo-stock` | Stock modificado por ventas o por el personal |
| `sonido-vivo-product-overrides` | Productos creados o editados desde administración |
| `sonido-vivo-low-stock-threshold` | Umbral de stock bajo |

---

## Pruebas

```bash
npm test
```

Cubren rutas protegidas, autenticación mock, pedidos y transiciones de estado, carga del catálogo desde Excel, datos de administración y reporte de ventas.

---

## Limitaciones (Fase 1)

- No hay backend: la autenticación y el control de acceso por rol (RBAC) se simulan solo en el cliente.
- El pago es simulado; no se conecta a pasarelas ni bancos reales.
- Los datos son locales a cada navegador; no se comparten entre dispositivos.
- Integración futura: API REST (Spring Boot), MySQL, JWT y HTTPS/TLS.

---
