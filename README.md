# Sonido Vivo — Prototipo Funcional

Prototipo funcional de e-commerce y plataforma de gestión integral para la tienda de instrumentos y equipos musicales **Sonido Vivo**. 

Desarrollado con **React + Vite** y **Tailwind CSS**, implementa una arquitectura modular de frontend con persistencia de datos local y *mock services* para simular flujos de compra y administración en tiempo real.

---
## Características Principales

El proyecto se divide en tres vistas :

### Módulo de Cliente
- **Catálogo e interacción:** Búsquedas avanzadas y detalle de productos.
- **Flujo de compra:** Carrito de compras y selección de tipo de despacho.
- **Seguimiento:** Historial de compras y rastreo de pedidos.
- **Información:** Ubicación interactiva en mapa.

### Módulo de Vendedor
- **Gestión operativa:** Control de inventario y procesamiento de pedidos.
- **Diseño Mobile-First:** Optimizado para la atención y gestión desde dispositivos móviles.

### Módulo de Administrador
- **Métricas:** Dashboard interactivo con KPIs de ventas e inventario.
- **Gestión de accesos:** Control de usuarios y asignación de roles.
- **Inventario y Pedidos:** Gestión centralizada del catálogo y estados de orden.
- **Auditoría:** Registro de logs de actividad (*audit logs*), enfocado en la trazabilidad de pedidos aprobados y no aprobados.

---

## Estructura del Proyecto

```text
super-enigma/
├── documentacion/
│   └── ERS.pdf                 # Especificación de Requerimientos de Software
├── frontend/
│   ├── public/ 
│   ├── src/
│   │   ├── assets/             # Imágenes, íconos y logotipos
│   │   ├── components/         # Componentes UI reutilizables (ui/, layout/, common/)
│   │   ├── context/            # Proveedores de estado global (Auth, Cart, Notification)
│   │   ├── hooks/              # Custom hooks (useAuth, useCart, etc.)
│   │   ├── modules/            # Módulos por dominio (auth, catalog, cart, checkout, orders)
│   │   ├── routes/             # Enrutamiento global y rutas protegidas por rol
│   │   ├── services/           # Capa de servicios simulados y mocks (JSON, XLSX)
│   │   ├── styles/             # Configuración y estilos con Tailwind CSS
│   │   ├── utils/              # Validadores, formateadores y constantes
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/                  # Pruebas unitarias
│   ├── package.json
│   └── vite.config.js
└── README.md