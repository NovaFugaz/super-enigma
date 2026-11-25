CREATE DATABASE IF NOT EXISTS sonidovivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- DROP USER IF EXISTS 'sonidovivo'@'localhost';
-- DROP USER IF EXISTS 'sonidovivo'@'127.0.0.1';

-- Local-demo credentials only. Compose creates its user from MYSQL_USER/MYSQL_PASSWORD instead.
CREATE USER IF NOT EXISTS 'sonidovivo'@'localhost' IDENTIFIED BY 'sonidovivo-local';
GRANT ALL PRIVILEGES ON sonidovivo.* TO 'sonidovivo'@'localhost';

CREATE USER IF NOT EXISTS 'sonidovivo'@'127.0.0.1' IDENTIFIED BY 'sonidovivo-local';
GRANT ALL PRIVILEGES ON sonidovivo.* TO 'sonidovivo'@'127.0.0.1';

FLUSH PRIVILEGES;


