CREATE DATABASE IF NOT EXISTS sonidovivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'sonidovivo'@'localhost' IDENTIFIED BY 'sonidovivo123';
GRANT ALL PRIVILEGES ON sonidovivo.* TO 'sonidovivo'@'localhost';

CREATE USER IF NOT EXISTS 'sonidovivo'@'127.0.0.1' IDENTIFIED BY 'sonidovivo123';
GRANT ALL PRIVILEGES ON sonidovivo.* TO 'sonidovivo'@'127.0.0.1';

FLUSH PRIVILEGES;

SHOW GRANTS FOR 'sonidovivo'@'localhost';
SHOW GRANTS FOR 'sonidovivo'@'127.0.0.1';