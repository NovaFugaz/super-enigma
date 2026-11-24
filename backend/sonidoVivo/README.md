# Backend con Docker

Desde esta carpeta (`backend/sonidoVivo`), levanta MySQL, el backend y Mailpit con:

```powershell
docker compose up --build
```

La primera compilación puede tardar mientras Maven descarga dependencias. Cuando termine, la API queda en `http://localhost:8080` y Swagger en `http://localhost:8080/swagger-ui.html`. MySQL queda disponible desde el host en el puerto `3307`; dentro de Compose, el backend se conecta al servicio `db` en el puerto `3306`.

Para recuperar una contraseña, usa `/recuperar` en el frontend. Los mensajes de correo no salen a Internet: se capturan en Mailpit, disponible en `http://localhost:8025` (SMTP del contenedor: `mailpit:1025`, SMTP desde el host: `localhost:1025`). Abre el mensaje más reciente y sigue su enlace antes de que expire, en 15 minutos.

Los valores de usuario, contraseñas y JWT incluidos en `compose.yml` son solo para desarrollo local. Se pueden reemplazar mediante variables de entorno o un archivo `.env` local (no se debe subir ese archivo al repositorio). Si cambias las credenciales de MySQL después de que ya se creó el volumen, MySQL conserva las credenciales iniciales; para una base demo nueva puedes borrar el volumen con el comando indicado abajo.

## Variables de entorno y memoria

Compose limita el backend y MySQL a `768m` cada uno (máximo combinado configurado: `1.5 GiB`). La JVM limita el heap a un 65 % de la memoria asignada al contenedor e inicia con un 20 %; se usa Serial GC para mantener bajo el consumo en esta demostración. MySQL usa un buffer pool de `128M` y un máximo de 40 conexiones.

Estos valores se pueden ajustar desde un `.env` local:

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `BACKEND_MEMORY_LIMIT` | `768m` | Límite del contenedor Spring Boot |
| `MYSQL_MEMORY_LIMIT` | `768m` | Límite del contenedor MySQL |
| `JAVA_TOOL_OPTIONS` | `-XX:MaxRAMPercentage=65.0 -XX:InitialRAMPercentage=20.0 -XX:+UseSerialGC` | Límites de heap y recolector de Java |
| `MYSQL_DATABASE` | `sonidovivo` | Base de datos |
| `MYSQL_USER` / `MYSQL_PASSWORD` | `sonidovivo` / `sonidovivo-local` | Usuario de aplicación en MySQL |
| `MYSQL_ROOT_PASSWORD` | `root-local-only` | Clave root de MySQL |
| `MYSQL_PORT` | `3307` | Puerto de MySQL expuesto al host |
| `JWT_SECRET` | Clave de ejemplo local | Clave JWT; debe tener al menos 32 caracteres |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Orígenes web permitidos, separados por coma |
| `FRONTEND_URL` | `http://localhost:5173` | Base del enlace de restablecimiento que se envía por correo |

Los límites son un presupuesto inicial de desarrollo, no una medición del uso real. Para medir consumo, inicia Docker Desktop y ejecuta `docker compose up --build`; luego revisa `docker stats` en otra terminal. Si el backend excede su límite, Docker puede detenerlo por falta de memoria; aumenta `BACKEND_MEMORY_LIMIT` y ajusta `JAVA_TOOL_OPTIONS` en conjunto.

Para detener los contenedores sin borrar la base:

```powershell
docker compose down
```

Para borrar también los datos persistidos de MySQL y comenzar de cero:

```powershell
docker compose down --volumes
```
## importante

- El frontend sigue ejecutándose por separado desde `frontend` con `npm run dev`. No es necesario contenerizarlo para probar el backend o Swagger.

- También se puede levantar el backend mediante 'Xampp' y mvn 'spring-boot:run'
mailpit se levanta por separado en una terminal.

## Estructura del proyecto

```text
backend/
├── README.md
└── sonidoVivo/
    ├── .dockerignore
    ├── .gitattributes
    ├── .mvn/
    │   └── wrapper/
    │       └── maven-wrapper.properties
    ├── Dockerfile
    ├── README.md
    ├── compose.yml                      # MySQL + backend + Mailpit
    ├── mvnw
    ├── mvnw.cmd
    ├── pom.xml
    └── src/
        ├── main/
        │   ├── java/com/patito/sonidoVivo/
        │   │   ├── SonidoVivoApplication.java
        │   │   ├── config/
        │   │   │   ├── DatosDemo.java           # usuarios demo
        │   │   │   ├── DemoCatalogSeeder.java   # catálogo demo
        │   │   │   ├── JwtConfig.java
        │   │   │   ├── SecurityConfig.java      # reglas por rol y CORS
        │   │   │   └── SwaggerConfig.java
        │   │   ├── controller/
        │   │   │   ├── AdminController.java
        │   │   │   ├── AuthController.java
        │   │   │   ├── CategoryController.java
        │   │   │   ├── LocationController.java
        │   │   │   ├── OrderController.java
        │   │   │   ├── ProductController.java
        │   │   │   ├── ProductStaffController.java
        │   │   │   ├── ReportController.java
        │   │   │   └── StaffOrderController.java
        │   │   ├── dto/
        │   │   │   ├── auth/
        │   │   │   │   ├── AuthResponse.java
        │   │   │   │   ├── LoginRequest.java
        │   │   │   │   ├── PasswordResetConfirmRequest.java
        │   │   │   │   ├── PasswordResetRequest.java
        │   │   │   │   ├── PasswordResetResponse.java
        │   │   │   │   ├── RegisterRequest.java
        │   │   │   │   └── ResetPasswordRequest.java
        │   │   │   ├── catalogo/
        │   │   │   │   ├── CategoryResponse.java
        │   │   │   │   ├── ProductFilter.java
        │   │   │   │   ├── ProductRequest.java
        │   │   │   │   ├── ProductResponse.java
        │   │   │   │   └── StockRequest.java
        │   │   │   ├── common/
        │   │   │   │   ├── ApiError.java
        │   │   │   │   └── Patterns.java
        │   │   │   ├── pedido/
        │   │   │   │   ├── OrderCreateRequest.java
        │   │   │   │   ├── OrderHistoryResponse.java
        │   │   │   │   ├── OrderItemRequest.java
        │   │   │   │   ├── OrderItemResponse.java
        │   │   │   │   ├── OrderMineResponse.java
        │   │   │   │   ├── OrderResponse.java
        │   │   │   │   ├── OrderStatusRequest.java
        │   │   │   │   └── OrderTrackingResponse.java
        │   │   │   ├── reports/
        │   │   │   │   └── SalesReportResponse.java
        │   │   │   ├── ubicacion/
        │   │   │   │   └── LocationResponse.java
        │   │   │   └── usuario/
        │   │   │       ├── UserCreateRequest.java
        │   │   │       ├── UserResponse.java
        │   │   │       └── UserUpdateRequest.java
        │   │   ├── enums/
        │   │   │   ├── LocationType.java
        │   │   │   ├── OrderStatus.java
        │   │   │   ├── Role.java
        │   │   │   └── ShippingMethod.java
        │   │   ├── exception/
        │   │   │   └── GlobalExceptionHandler.java
        │   │   ├── model/
        │   │   │   ├── Category.java
        │   │   │   ├── CustomerOrder.java
        │   │   │   ├── Location.java
        │   │   │   ├── OrderItem.java
        │   │   │   ├── OrderStatusHistory.java
        │   │   │   ├── PasswordResetToken.java
        │   │   │   ├── Product.java
        │   │   │   └── User.java
        │   │   ├── repository/
        │   │   │   ├── CategoryRepository.java
        │   │   │   ├── CustomerOrderRepository.java
        │   │   │   ├── LocationRepository.java
        │   │   │   ├── PasswordResetTokenRepository.java
        │   │   │   ├── ProductRepository.java
        │   │   │   └── UserRepository.java
        │   │   └── service/
        │   │       ├── AuthService.java
        │   │       ├── CategoryService.java
        │   │       ├── LocationService.java
        │   │       ├── OrderService.java
        │   │       ├── PasswordResetService.java
        │   │       ├── ProductService.java
        │   │       ├── ReportService.java
        │   │       ├── TokenService.java
        │   │       └── UserService.java
        │   └── resources/
        │       ├── application.properties
        │       └── data/
        │           └── demo-catalog.json
        └── test/
            └── java/com/patito/sonidoVivo/
                ├── SonidoVivoApplicationTests.java
                ├── config/
                │   └── SecurityConfigTest.java
                └── service/
                    ├── OrderServiceTest.java
                    └── PasswordResetServiceTest.java
```