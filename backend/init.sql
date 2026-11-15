-- =====================================================================
-- Sonido Vivo - init.sql
-- =====================================================================

-- ---------------------------------------------------------------------
-- USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    username                VARCHAR(40)  NOT NULL,
    phone                   VARCHAR(9)   NOT NULL,
    email                   VARCHAR(100) NOT NULL,
    password_hash           VARCHAR(255) NOT NULL,
    rol                     VARCHAR(20)  NOT NULL,
    active                  TINYINT(1)   NOT NULL DEFAULT 1,
    reset_token_hash        VARCHAR(255) NULL,
    reset_token_expires_at  DATETIME(6)  NULL,
    created_at              DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at              DATETIME(6)  NULL     DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_email (email),
    KEY idx_usuarios_reset_token (reset_token_hash),
    KEY idx_usuarios_rol_active (rol, active),
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('CUSTOMER', 'SELLER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- CATEGORIAS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    slug         VARCHAR(60)  NOT NULL,
    name         VARCHAR(80)  NOT NULL,
    description  VARCHAR(250) NULL,
    image_url    VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categorias_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PRODUCTOS
-- version: columna de @Version (bloqueo optimista). Debe ser NOT NULL
-- DEFAULT 0; si quedara NULL, Spring Data trataría el producto como nuevo.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    code            VARCHAR(30)   NOT NULL,
    name            VARCHAR(70)   NOT NULL,
    brand           VARCHAR(70)   NULL,
    model           VARCHAR(70)   NOT NULL,
    description     VARCHAR(400)  NOT NULL,
    category_id     BIGINT        NOT NULL,
    price           BIGINT        NOT NULL,
    discount_price  BIGINT        NULL,
    stock           INT           NOT NULL DEFAULT 0,
    version         BIGINT        NOT NULL DEFAULT 0,
    image_url       VARCHAR(255)  NULL,
    gallery_urls    VARCHAR(1000) NULL,
    active          TINYINT(1)    NOT NULL DEFAULT 1,
    featured        TINYINT(1)    NOT NULL DEFAULT 0,
    created_at      DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)   NULL     DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_productos_code (code),
    KEY idx_productos_category (category_id),
    KEY idx_productos_active_featured (active, featured),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (category_id) REFERENCES categorias (id),
    CONSTRAINT chk_productos_price CHECK (price > 0),
    CONSTRAINT chk_productos_discount CHECK (discount_price IS NULL OR discount_price > 0),
    CONSTRAINT chk_productos_stock CHECK (stock >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- UBICACIONES (tienda y puntos de retiro)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ubicaciones (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    slug       VARCHAR(100) NOT NULL,
    type       VARCHAR(50)  NOT NULL,
    carrier    VARCHAR(50)  NULL,
    name       VARCHAR(150) NOT NULL,
    address    VARCHAR(250) NOT NULL,
    latitude   DOUBLE       NOT NULL,
    longitude  DOUBLE       NOT NULL,
    hours      VARCHAR(500) NOT NULL,
    note       VARCHAR(250) NULL,
    active     TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ubicaciones_slug (slug),
    CONSTRAINT chk_ubicaciones_type CHECK (type IN ('STORE', 'PICKUP')),
    CONSTRAINT chk_ubicaciones_carrier CHECK (carrier IS NULL OR carrier IN ('STARKEN', 'CHILEXPRESS'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PEDIDOS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    order_number        VARCHAR(30)  NOT NULL,
    tracking_number     VARCHAR(30)  NULL,
    buyer_id            BIGINT       NOT NULL,
    shipping_method     VARCHAR(20)  NOT NULL,
    shipping_address    VARCHAR(250) NULL,
    pickup_location_id  BIGINT       NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    subtotal            BIGINT       NOT NULL,
    shipping_cost       BIGINT       NOT NULL DEFAULT 0,
    iva                 BIGINT       NOT NULL,
    total               BIGINT       NOT NULL,
    receipt_number      VARCHAR(255) NULL,
    receipt_type        VARCHAR(20)  NULL,
    receipt_issued_at   DATETIME(6)  NULL,
    created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)  NULL     DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_pedidos_order_number (order_number),
    UNIQUE KEY uk_pedidos_tracking_number (tracking_number),
    KEY idx_pedidos_buyer (buyer_id),
    KEY idx_pedidos_status (status),
    KEY idx_pedidos_pickup_location (pickup_location_id),
    CONSTRAINT fk_pedidos_comprador FOREIGN KEY (buyer_id) REFERENCES usuarios (id),
    CONSTRAINT fk_pedidos_ubicacion FOREIGN KEY (pickup_location_id) REFERENCES ubicaciones (id),
    CONSTRAINT chk_pedidos_shipping CHECK (shipping_method IN ('DOMICILIO', 'RETIRO')),
    CONSTRAINT chk_pedidos_status CHECK (status IN ('PENDIENTE', 'EN_PROCESO', 'VALIDADO', 'ENVIADO', 'ENTREGADO', 'RECHAZADO')),
    CONSTRAINT chk_pedidos_receipt CHECK (receipt_type IS NULL OR receipt_type IN ('BOLETA', 'FACTURA'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- DETALLE_PEDIDOS (copia de nombre/precio al momento de la compra)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    order_id      BIGINT      NOT NULL,
    product_id    BIGINT      NOT NULL,
    product_code  VARCHAR(30) NOT NULL,
    product_name  VARCHAR(70) NOT NULL,
    brand         VARCHAR(70) NULL,
    model         VARCHAR(70) NOT NULL,
    unit_price    BIGINT      NOT NULL,
    quantity      INT         NOT NULL,
    line_total    BIGINT      NOT NULL,
    PRIMARY KEY (id),
    KEY idx_detalle_order (order_id),
    KEY idx_detalle_product (product_id),
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (order_id) REFERENCES pedidos (id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (product_id) REFERENCES productos (id),
    CONSTRAINT chk_detalle_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- PAGOS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    order_id            BIGINT       NOT NULL,
    method              VARCHAR(20)  NOT NULL,
    status              VARCHAR(20)  NOT NULL,
    amount              BIGINT       NOT NULL,
    transaction_id      VARCHAR(50)  NULL,
    authorization_code  VARCHAR(50)  NULL,
    proof_reference     VARCHAR(255) NULL,
    created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_pagos_order (order_id),
    CONSTRAINT fk_pagos_pedido FOREIGN KEY (order_id) REFERENCES pedidos (id),
    CONSTRAINT chk_pagos_method CHECK (method IN ('DEBITO', 'CREDITO', 'TRANSFERENCIA')),
    CONSTRAINT chk_pagos_status CHECK (status IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- HISTORIAL_ESTADOS (auditoría de cambios de estado del pedido)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial_estados (
    id           BIGINT      NOT NULL AUTO_INCREMENT,
    order_id     BIGINT      NOT NULL,
    from_status  VARCHAR(20) NULL,
    to_status    VARCHAR(20) NOT NULL,
    actor_id     BIGINT      NOT NULL,
    actor_role   VARCHAR(20) NOT NULL,
    created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_historial_order (order_id),
    KEY idx_historial_actor (actor_id),
    CONSTRAINT fk_historial_pedido FOREIGN KEY (order_id) REFERENCES pedidos (id) ON DELETE CASCADE,
    CONSTRAINT fk_historial_actor FOREIGN KEY (actor_id) REFERENCES usuarios (id),
    CONSTRAINT chk_historial_from CHECK (from_status IS NULL OR from_status IN ('PENDIENTE', 'EN_PROCESO', 'VALIDADO', 'ENVIADO', 'ENTREGADO', 'RECHAZADO')),
    CONSTRAINT chk_historial_to CHECK (to_status IN ('PENDIENTE', 'EN_PROCESO', 'VALIDADO', 'ENVIADO', 'ENTREGADO', 'RECHAZADO')),
    CONSTRAINT chk_historial_role CHECK (actor_role IN ('CUSTOMER', 'SELLER', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- SUSCRIPCIONES (newsletter)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suscripciones (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    email          VARCHAR(100) NOT NULL,
    active         TINYINT(1)   NOT NULL DEFAULT 1,
    subscribed_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_suscripciones_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- CONFIGURACIONES (clave/valor)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS configuraciones (
    setting_key    VARCHAR(50)  NOT NULL,
    setting_value  VARCHAR(255) NOT NULL,
    PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =====================================================================
-- DATOS INICIALES
-- =====================================================================

-- ---------------------------------------------------------------------
-- Usuarios de prueba (contraseñas con BCrypt, cost 10)
--   admin@sonidovivo.cl     / Admin123!     -> ADMIN
--   vendedor@sonidovivo.cl  / Vendedor123!  -> SELLER (funcionario)
--   cliente@sonidovivo.cl   / Cliente123!   -> CUSTOMER
-- Solo para desarrollo: cambiar o borrar antes de producción.
-- ---------------------------------------------------------------------
INSERT IGNORE INTO usuarios (username, phone, email, password_hash, rol, active) VALUES
('Administrador Demo', '933333333', 'admin@sonidovivo.cl',    '$2a$10$mQ5RVLbyYO8jZc8RhMNVI.Rk2y0ypdHC1Cd38vRvkTaV94QpMoh1m', 'ADMIN',    1),
('Vendedor Demo',      '922222222', 'vendedor@sonidovivo.cl', '$2a$10$5DysRgkjPXxA5/U9RlToFemKGyXpFRXbAkPufZ.BmShWFWq4ffVuO', 'SELLER',   1),
('Cliente Demo',       '911111111', 'cliente@sonidovivo.cl',  '$2a$10$jnexzf9oa9Bok4OxKGO2eej5FQZqV3oxvY3Gi9RB8d3nA2ihaOxnm', 'CUSTOMER', 1);

-- ---------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------
INSERT IGNORE INTO categorias (slug, name, description) VALUES
('guitarras-acusticas', 'Guitarras Acústicas', 'Folk, Dreadnought, Clásica, Electroacústica, Niños'),
('guitarras-electricas', 'Guitarras Eléctricas', 'Stratocaster, Telecaster, Les Paul, SG, Semi-hollow, Signature'),
('bajos-electricos', 'Bajos Eléctricos', 'Precision, Jazz, Activo, Acústico, Fretless'),
('baterias', 'Baterías', 'Acústica, Electrónica, Cajas, Platillos, Stands'),
('teclados-pianos', 'Teclados y Pianos', 'Digital, Sintetizador, MIDI Controller, Órgano'),
('amplificadores', 'Amplificadores', 'Guitarra combo, Guitarra cabezal, Bajo, Acústico, Teclado'),
('microfonos', 'Micrófonos', 'Dinámico, Condensador, USB, Ribbon, Lavalier'),
('pedales-de-efectos', 'Pedales de Efectos', 'Distorsión, Overdrive, Fuzz, Reverb, Delay, Chorus, Multi-FX'),
('accesorios', 'Accesorios', 'Cuerdas, Púas, Soportes, Cables, Correas, Afinadores'),
('estudio-grabacion', 'Estudio y Grabación', 'Interfaces, Auriculares, Monitores, Pop filters, DAW');

-- ---------------------------------------------------------------------
-- Productos (catálogo del antiguo catalogo.xlsx)
-- featured = 1 -> aparecen en destacados
-- ---------------------------------------------------------------------
INSERT IGNORE INTO productos (code, category_id, name, brand, model, stock, price, description, featured) VALUES
('GA001', (SELECT id FROM categorias WHERE slug = 'guitarras-acusticas'), 'Guitarra Acústica Folk', 'Yamaha', 'F310', 8, 129990, 'Tapa de abeto, aros y fondo de meranti. Ideal para iniciantes.', 0),
('GA002', (SELECT id FROM categorias WHERE slug = 'guitarras-acusticas'), 'Guitarra Acústica Dreadnought', 'Fender', 'CD-60S', 5, 189990, 'Tapa de abeto macizo, brazo de caoba. Sonido cálido y proyectado.', 1),
('GA003', (SELECT id FROM categorias WHERE slug = 'guitarras-acusticas'), 'Guitarra Acústica Clásica 4/4', 'Yamaha', 'C40', 10, 89990, 'Nailon, tapa de abeto. Ideal para estudio y flamenco.', 0),
('GA004', (SELECT id FROM categorias WHERE slug = 'guitarras-acusticas'), 'Guitarra Electroacústica', 'Takamine', 'GN20CE', 3, 349990, 'Pickup integrado, afinador incorporado.', 0),
('GA005', (SELECT id FROM categorias WHERE slug = 'guitarras-acusticas'), 'Guitarra 3/4 Niños', 'Yamaha', 'JR1', 6, 79990, 'Tamaño reducido para niños de 6 a 10 años.', 0),
('GE001', (SELECT id FROM categorias WHERE slug = 'guitarras-electricas'), 'Guitarra Eléctrica Stratocaster', 'Squier', 'Affinity Strat', 5, 249990, 'Cuerpo de álamo, mástil de arce, pastillas SSS.', 1),
('GE002', (SELECT id FROM categorias WHERE slug = 'guitarras-electricas'), 'Guitarra Eléctrica Les Paul', 'Epiphone', 'Les Paul Std', 4, 329990, 'Cuerpo caoba, tapa arce, pastillas humbucker.', 0),
('GE003', (SELECT id FROM categorias WHERE slug = 'guitarras-electricas'), 'Guitarra Eléctrica SG', 'Epiphone', 'SG Standard', 3, 319990, 'Cuerpo caoba, mástil caoba, 2 humbuckers.', 0),
('GE004', (SELECT id FROM categorias WHERE slug = 'guitarras-electricas'), 'Guitarra Eléctrica Telecaster', 'Squier', 'Affinity Tele', 4, 239990, 'Cuerpo álamo, clavijero vintage, 2 pastillas single.', 0),
('GE005', (SELECT id FROM categorias WHERE slug = 'guitarras-electricas'), 'Guitarra Eléctrica Semi-hollow', 'Epiphone', 'ES-335', 2, 549990, 'Semi-hueca, 2 humbuckers, ideal para jazz y blues.', 0),
('BA001', (SELECT id FROM categorias WHERE slug = 'bajos-electricos'), 'Bajo Eléctrico 4 Cuerdas', 'Squier', 'Affinity PJ', 5, 299990, 'Pickup PJ, cuerpo álamo, mástil arce.', 0),
('BA002', (SELECT id FROM categorias WHERE slug = 'bajos-electricos'), 'Bajo Eléctrico Jazz Bass', 'Fender', 'Player Jazz', 2, 699990, 'Alder body, 2 Alnico V Jazz single-coil.', 0),
('BA003', (SELECT id FROM categorias WHERE slug = 'bajos-electricos'), 'Bajo Acústico 4 Cuerdas', 'Yamaha', 'APX700II', 2, 429990, 'Electroacústico, afinador incorporado.', 0),
('BT001', (SELECT id FROM categorias WHERE slug = 'baterias'), 'Batería Acústica 5 piezas', 'Pearl', 'Roadshow', 2, 599990, 'Incluye stands, platillos y pedal de bombo.', 0),
('BT002', (SELECT id FROM categorias WHERE slug = 'baterias'), 'Batería Electrónica 8 pads', 'Roland', 'TD-02KV', 2, 799990, 'Módulo TD-02, 8 pads de goma, pedal hi-hat.', 0),
('BT003', (SELECT id FROM categorias WHERE slug = 'baterias'), 'Caja Snare 14"', 'Pearl', 'STE1450', 4, 89990, 'Acero, 14x5", 10 tensores.', 0),
('BT004', (SELECT id FROM categorias WHERE slug = 'baterias'), 'Platillo Hi-Hat 14"', 'Zildjian', 'A Series', 3, 149990, 'Latón B20, sonido brillante y claro.', 0),
('BT005', (SELECT id FROM categorias WHERE slug = 'baterias'), 'Platillo Crash 16"', 'Zildjian', 'A Series', 3, 129990, 'Latón B20, ataque rápido.', 0),
('TC001', (SELECT id FROM categorias WHERE slug = 'teclados-pianos'), 'Teclado Digital 61 teclas', 'Yamaha', 'PSR-E373', 4, 249990, '61 teclas sensibles al tacto, 622 voces.', 0),
('TC002', (SELECT id FROM categorias WHERE slug = 'teclados-pianos'), 'Piano Digital 88 teclas', 'Yamaha', 'P-45', 2, 499990, '88 teclas pesadas, 10 voces, pedal sustain incluido.', 1),
('TC003', (SELECT id FROM categorias WHERE slug = 'teclados-pianos'), 'Sintetizador 49 teclas', 'Arturia', 'MiniLab MKII', 5, 129990, 'MIDI controller, 49 mini teclas.', 0),
('TC004', (SELECT id FROM categorias WHERE slug = 'teclados-pianos'), 'Teclado MIDI 88 teclas', 'M-Audio', 'Hammer 88', 2, 399990, '88 teclas martillo, sin sonidos propios.', 0),
('AM001', (SELECT id FROM categorias WHERE slug = 'amplificadores'), 'Amplificador Guitarra 15W', 'Fender', 'Frontman 15G', 5, 99990, '15W, distorsión incorporada, entrada auxiliar.', 0),
('AM002', (SELECT id FROM categorias WHERE slug = 'amplificadores'), 'Amplificador Guitarra 40W', 'Marshall', 'MG40GFX', 3, 299990, '40W, 4 canales, efectos digitales integrados.', 1),
('AM003', (SELECT id FROM categorias WHERE slug = 'amplificadores'), 'Amplificador Bajo 100W', 'Hartke', 'HD100', 2, 449990, '100W, tweeter integrado, ecualizador de 4 bandas.', 0),
('AM004', (SELECT id FROM categorias WHERE slug = 'amplificadores'), 'Amplificador Acústico 40W', 'Fishman', 'Loudbox Mini', 2, 499990, '60W, 2 canales, reverb y chorus incorporados.', 0),
('MI001', (SELECT id FROM categorias WHERE slug = 'microfonos'), 'Micrófono Dinámico Cardioide', 'Shure', 'SM58', 8, 149990, 'Estándar industria para voz en vivo.', 1),
('MI002', (SELECT id FROM categorias WHERE slug = 'microfonos'), 'Micrófono Dinámico Instrumento', 'Shure', 'SM57', 6, 139990, 'Ideal para captura de instrumentos y amplificadores.', 0),
('MI003', (SELECT id FROM categorias WHERE slug = 'microfonos'), 'Micrófono Condensador', 'Audio-Tech.', 'AT2020', 4, 199990, 'Cardioide, XLR, ideal para grabación en estudio.', 0),
('MI004', (SELECT id FROM categorias WHERE slug = 'microfonos'), 'Micrófono USB de Condensador', 'Blue', 'Yeti', 5, 299990, 'USB, 4 patrones polares, ideal para streaming y podcast.', 0),
('PE001', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Distorsión', 'Boss', 'DS-1', 7, 79990, 'Clásico pedal de distorsión, 3 controles.', 0),
('PE002', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Reverb', 'Boss', 'RV-6', 4, 179990, '8 modos de reverb, control de shimmer.', 0),
('PE003', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Multi-efectos', 'Boss', 'ME-80', 2, 349990, 'Diseño tipo pedalboard, 8 efectos simultáneos.', 0),
('PE004', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Tuner Cromático', 'Boss', 'TU-3', 8, 89990, 'Afinador cromático, indicador de tono.', 0),
('PE005', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Delay', 'MXR', 'Carbon Copy', 4, 179990, 'Delay analógico cálido, tiempo 600ms.', 0),
('PE006', (SELECT id FROM categorias WHERE slug = 'pedales-de-efectos'), 'Pedal Overdrive', 'Ibanez', 'TS9', 6, 99990, 'Tube Screamer clásico, sonido suave y orgánico.', 1),
('AC001', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Cuerdas Guitarra Eléctrica 09-42', 'Ernie Ball', 'Super Slinky', 25, 8990, 'Juego 6 cuerdas, calibre ligero.', 0),
('AC002', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Cuerdas Guitarra Acústica 12-53', 'Ernie Ball', 'Earthwood', 20, 10990, 'Bronce fósforo, sonido cálido.', 0),
('AC003', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Cuerdas Bajo 45-105', 'Ernie Ball', 'Regular Slinky', 12, 14990, 'Cuerdas de níquel enrollado, set 4 cuerdas.', 0),
('AC004', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Púas de Guitarra x10 (0.73mm)', 'Fender', '351', 50, 3990, 'Celulosa, grosor medio.', 0),
('AC005', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Capotraste Guitarra', 'Dunlop', 'Trigger', 15, 12990, 'Capotraste de resorte, compatible 6 cuerdas.', 0),
('AC006', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Afinador de Clip', 'Snark', 'SN-5', 20, 8990, 'Afinador cromático de clip, pantalla giratoria.', 0),
('AC007', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Cable Instrumento 3m', 'Monster', 'S100-I-3', 15, 12990, 'Cable trenzado, conectores dorados, 3 metros.', 0),
('AC008', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Cable Instrumento 6m', 'Monster', 'S100-I-6', 10, 17990, 'Cable trenzado, conectores dorados, 6 metros.', 0),
('AC009', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Soporte Guitarra de Piso', 'Hercules', 'GS302B', 12, 22990, 'Soporte plegable con enganche automático.', 0),
('AC010', (SELECT id FROM categorias WHERE slug = 'accesorios'), 'Soporte Guitarra de Pared', 'Hercules', 'WAH-202', 10, 18990, 'Montaje a pared, enganche automático.', 0),
('ES001', (SELECT id FROM categorias WHERE slug = 'estudio-grabacion'), 'Interfaz de Audio 2x2 USB', 'Focusrite', 'Scarlett Solo', 4, 149990, '1 entrada XLR+instrumento, 2 salidas, 24bit/192kHz.', 0),
('ES002', (SELECT id FROM categorias WHERE slug = 'estudio-grabacion'), 'Auriculares de Estudio', 'Audio-Tech.', 'ATH-M20x', 6, 79990, 'Circumaurales, respuesta 15Hz-20kHz.', 0),
('ES003', (SELECT id FROM categorias WHERE slug = 'estudio-grabacion'), 'Auriculares de Estudio Pro', 'Audio-Tech.', 'ATH-M50x', 4, 219990, 'Referencia de industria, sonido neutro y detallado.', 0),
('ES004', (SELECT id FROM categorias WHERE slug = 'estudio-grabacion'), 'Monitor de Estudio 5"', 'Yamaha', 'HS5', 2, 349990, 'Altavoz activo, respuesta plana, ideal mezcla.', 0),
('ES005', (SELECT id FROM categorias WHERE slug = 'estudio-grabacion'), 'Pop Filter para Micrófono', 'Sennheiser', 'MZP 40', 8, 14990, 'Doble malla, brazo flexible con clip.', 0);

-- ---------------------------------------------------------------------
-- Ubicaciones (tienda + puntos de retiro)
-- hours: una línea por tramo (separadas con salto de línea)
-- ---------------------------------------------------------------------
INSERT IGNORE INTO ubicaciones (slug, type, carrier, name, address, latitude, longitude, hours, note, active) VALUES
('tienda', 'STORE', NULL,
 'Sonido Vivo - Tienda',
 'Av. Valparaíso 581, Loc 17, Viña del Mar, Valparaíso',
 -33.0241, -71.5543,
 CONCAT_WS(CHAR(10), 'Lunes a Viernes: 10:30 - 19:30 hrs', 'Sábados y Domingos: Cerrado'),
 'Ubicación de la tienda física.', 1),
('retiro-centro', 'PICKUP', 'STARKEN',
 'Starken Viña Batuco',
 'Av. Valparaíso 1195, Viña del Mar, Valparaíso',
 -33.0259, -71.5449,
 CONCAT_WS(CHAR(10), 'Lunes a Viernes: 09:00 - 18:30 hrs', 'Sábados: 09:00 - 13:00', 'Domingo y festivos: Cerrado'),
 'Retiro de pedidos Starken', 1),
('retiro-chile', 'PICKUP', 'CHILEXPRESS',
 'Chilexpress Centro de Servicios',
 'San Antonio 1218, Viña del Mar, Valparaíso',
 -33.0110, -71.5426,
 CONCAT_WS(CHAR(10), 'Lunes a Viernes: 09:00 - 18:00 hrs', 'Sábados: 10:00 - 13:00', 'Domingo y festivos: Cerrado'),
 'Retiro de pedidos Chilexpress', 1);