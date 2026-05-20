-- Ianuarius Athletics Club — esquema completo
-- Importar en una base de datos vacía llamada `ianuarius_db`
-- Credenciales Docker por defecto: root / root

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;
SET time_zone = "+00:00";
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Categorías atléticas (rangos de edad; veteranos separados por género)
-- --------------------------------------------------------
CREATE TABLE `categorias` (
    `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
    `nombre`       VARCHAR(50) NOT NULL,
    `edad_min`     INT NOT NULL,
    `edad_max`     INT NOT NULL,
    `genero`       ENUM('M','F') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Catálogo de disciplinas atléticas
-- --------------------------------------------------------
CREATE TABLE `pruebas` (
    `id_prueba`     INT AUTO_INCREMENT PRIMARY KEY,
    `nombre_prueba` VARCHAR(50) NOT NULL,
    `tipo`          ENUM(
                        'Velocidad Corta','Velocidad Larga','Vallas',
                        'Medio Fondo','Fondo','Larga Distancia',
                        'Obstaculos','Salto','Lanzamiento','Marcha','Relevos'
                    ) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Especificaciones técnicas por prueba, categoría y género
-- --------------------------------------------------------
CREATE TABLE `pruebas_variantes` (
    `id_variante`       INT AUTO_INCREMENT PRIMARY KEY,
    `id_prueba`         INT NOT NULL,
    `id_categoria`      INT NOT NULL,
    `genero_aplicable`  ENUM('M','F','Ambos') NOT NULL,
    `especificaciones`  VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (`id_prueba`)    REFERENCES `pruebas`(`id_prueba`)    ON DELETE CASCADE,
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Usuarios del sistema: atletas, entrenadores y administradores
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
    `id_usuario`           INT AUTO_INCREMENT PRIMARY KEY,
    `id_categoria`         INT DEFAULT NULL,
    `nombre`               VARCHAR(50) NOT NULL,
    `apellidos`            VARCHAR(100) NOT NULL,
    `dni`                  VARCHAR(9) UNIQUE DEFAULT NULL,
    `email`                VARCHAR(100) UNIQUE NOT NULL,
    `password_hash`        VARCHAR(255) DEFAULT NULL,
    `google_id`            VARCHAR(255) UNIQUE DEFAULT NULL,
    `rol`                  ENUM('Admin','Entrenador','Atleta') DEFAULT 'Atleta',
    `fecha_nacimiento`     DATE NOT NULL,
    `genero`               ENUM('M','F') NOT NULL,
    `estado_cuenta`        TINYINT(1) DEFAULT 1,
    `foto_perfil`          MEDIUMTEXT DEFAULT NULL,
    `foto_dni`             MEDIUMTEXT DEFAULT NULL,
    `foto_carnet`          MEDIUMTEXT DEFAULT NULL,
    `inscripcion_pdf`      MEDIUMTEXT DEFAULT NULL,
    `notificaciones_email` TINYINT(1) NOT NULL DEFAULT 1,
    `frecuencia_notif`     VARCHAR(10) NOT NULL DEFAULT 'alta',
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Ficha de inscripción por temporada, una por atleta
-- --------------------------------------------------------
CREATE TABLE `fichas_inscripcion` (
    `id_ficha`          INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario`        INT UNIQUE NOT NULL,
    `temporada`         VARCHAR(20) NOT NULL,
    `estado_validacion` ENUM('pendiente','validado','error_dni') DEFAULT 'pendiente',
    `estado_pago`       ENUM('pendiente','pagado') DEFAULT 'pendiente',
    `ruta_pdf`          VARCHAR(255) DEFAULT NULL,
    `ruta_dni`          VARCHAR(255) DEFAULT NULL,
    `fecha_creacion`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Registro de sesiones de entrenamiento y sensaciones del atleta
-- --------------------------------------------------------
CREATE TABLE `feedback_entrenamientos` (
    `id_registro`       INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario`        INT NOT NULL,
    `fecha`             DATE NOT NULL,
    `sesion_realizada`  TEXT NOT NULL,
    `sensaciones`       TEXT DEFAULT NULL,
    FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Eventos del calendario de competiciones
-- --------------------------------------------------------
CREATE TABLE `eventos_calendario` (
    `id_evento`   INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario`  INT NOT NULL,
    `id_categoria` INT DEFAULT NULL,
    `titulo`      VARCHAR(100) NOT NULL,
    `descripcion` TEXT,
    `fecha_hora`  DATETIME NOT NULL,
    `fecha_fin`   DATE DEFAULT NULL,
    `enlace`      VARCHAR(500) DEFAULT NULL,
    `tipo_evento` ENUM('nacional','autonomico','provincial','control','escolares') NOT NULL,
    `tipo_pista`  ENUM('aire libre','pista cubierta','cross') NOT NULL,
    FOREIGN KEY (`id_usuario`)   REFERENCES `usuarios`(`id_usuario`)     ON DELETE CASCADE,
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Marcas deportivas registradas por los atletas
-- --------------------------------------------------------
CREATE TABLE `marcas` (
    `id_marca`          INT AUTO_INCREMENT PRIMARY KEY,
    `id_usuario`        INT NOT NULL,
    `id_categoria`      INT DEFAULT NULL,
    `id_evento`         INT DEFAULT NULL,
    `prueba`            VARCHAR(50) NOT NULL,
    `temporada`         ENUM('short_track','outdoor') NOT NULL,
    `tipo_competicion`  ENUM('Nacional','Autonomico','Provincial','Escolar','Control') NOT NULL DEFAULT 'Control',
    `marca`             VARCHAR(20) NOT NULL,
    `fecha`             DATE NOT NULL,
    `sensaciones_valor` TINYINT DEFAULT NULL,
    `sensaciones_notas` VARCHAR(500) DEFAULT NULL,
    FOREIGN KEY (`id_usuario`)   REFERENCES `usuarios`(`id_usuario`)               ON DELETE CASCADE,
    FOREIGN KEY (`id_categoria`) REFERENCES `categorias`(`id_categoria`)           ON DELETE SET NULL,
    FOREIGN KEY (`id_evento`)    REFERENCES `eventos_calendario`(`id_evento`)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Tokens de recuperación de contraseña (un solo uso con caducidad)
-- --------------------------------------------------------
CREATE TABLE `password_resets` (
    `id`         INT AUTO_INCREMENT PRIMARY KEY,
    `email`      VARCHAR(255) NOT NULL,
    `token`      VARCHAR(64) NOT NULL UNIQUE,
    `expires_at` DATETIME NOT NULL,
    `usado`      TINYINT(1) NOT NULL DEFAULT 0,
    `creado_en`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Configuración del club (plantilla PDF de inscripción y otros parámetros)
-- --------------------------------------------------------
CREATE TABLE `configuracion_club` (
    `clave`          VARCHAR(50) PRIMARY KEY,
    `valor`          LONGTEXT,
    `actualizado_en` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Log de ejecución de tareas cron
-- --------------------------------------------------------
CREATE TABLE `cron_log` (
    `id`    INT AUTO_INCREMENT PRIMARY KEY,
    `tipo`  VARCHAR(50) NOT NULL,
    `fecha` DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- ========================================================
-- DATOS DE CATÁLOGO
-- ========================================================

-- Categorías atléticas
INSERT INTO `categorias` (`nombre`, `edad_min`, `edad_max`, `genero`) VALUES
('Sub-10',    0,   9, NULL),
('Sub-12',   10,  11, NULL),
('Sub-14',   12,  13, NULL),
('Sub-16',   14,  15, NULL),
('Sub-18',   16,  17, NULL),
('Sub-20',   18,  19, NULL),
('Sub-23',   20,  22, NULL),
('Absoluta', 23,  34, NULL),
('M35',      35,  39, 'M'),
('F35',      35,  39, 'F'),
('M40',      40,  44, 'M'),
('F40',      40,  44, 'F'),
('M45',      45,  49, 'M'),
('F45',      45,  49, 'F'),
('M50',      50,  54, 'M'),
('F50',      50,  54, 'F'),
('M55',      55,  59, 'M'),
('F55',      55,  59, 'F'),
('M60',      60,  64, 'M'),
('F60',      60,  64, 'F'),
('M65',      65, 150, 'M'),
('F65',      65, 150, 'F');

-- Pruebas atléticas
-- IDs de categoría: Sub-14=3, Sub-16=4, Sub-18=5, Sub-20=6, Sub-23=7, Absoluta=8
-- Masters M: M35=9, M40=11, M45=13, M50=15, M55=17, M60=19, M65=21
-- Masters F: F35=10, F40=12, F45=14, F50=16, F55=18, F60=20, F65=22
INSERT INTO `pruebas` (`id_prueba`, `nombre_prueba`, `tipo`) VALUES
( 1, '400m lisos',              'Velocidad Larga'),
( 2, '400m vallas',             'Vallas'),
( 3, '50m lisos',               'Velocidad Corta'),
( 4, '60m lisos',               'Velocidad Corta'),
( 5, '80m lisos',               'Velocidad Corta'),
( 6, '100m lisos',              'Velocidad Corta'),
( 7, '200m lisos',              'Velocidad Corta'),
( 8, '300m lisos',              'Velocidad Larga'),
( 9, '600m lisos',              'Medio Fondo'),
(10, '800m lisos',              'Medio Fondo'),
(11, '1000m lisos',             'Medio Fondo'),
(12, '1500m lisos',             'Medio Fondo'),
(13, '3000m lisos',             'Fondo'),
(14, '5000m lisos',             'Larga Distancia'),
(15, '10000m lisos',            'Larga Distancia'),
(16, '60m vallas',              'Vallas'),
(17, '80m vallas',              'Vallas'),
(18, '100m vallas',             'Vallas'),
(19, '110m vallas',             'Vallas'),
(20, '220m vallas',             'Vallas'),
(21, '300m vallas',             'Vallas'),
(22, '2000m obstaculos',        'Obstaculos'),
(23, '3000m obstaculos',        'Obstaculos'),
(24, 'Salto de longitud',       'Salto'),
(25, 'Triple salto',            'Salto'),
(26, 'Salto de altura',         'Salto'),
(27, 'Salto con pertiga',       'Salto'),
(28, 'Lanzamiento de peso',     'Lanzamiento'),
(29, 'Lanzamiento de disco',    'Lanzamiento'),
(30, 'Lanzamiento de jabalina', 'Lanzamiento'),
(31, 'Lanzamiento de martillo', 'Lanzamiento'),
(32, '3000m marcha',            'Marcha'),
(33, '5000m marcha',            'Marcha'),
(34, '10km marcha',             'Marcha'),
(35, '20km marcha',             'Marcha'),
(36, '4x100m Masc',             'Relevos'),
(37, '4x100m Fem',              'Relevos'),
(38, '4x100m Mix',              'Relevos'),
(39, '4x400m Masc',             'Relevos'),
(40, '4x400m Fem',              'Relevos'),
(41, '4x400m Mix',              'Relevos');

-- Variantes de vallas
INSERT INTO `pruebas_variantes` (`id_prueba`, `id_categoria`, `genero_aplicable`, `especificaciones`) VALUES
-- 60m vallas (id 16)
(16, 3, 'M', 'altura: 0.84m'),
(16, 3, 'F', 'altura: 0.76m'),
(16, 4, 'M', 'altura: 0.91m'),
(16, 4, 'F', 'altura: 0.76m'),
(16, 5, 'M', 'altura: 0.91m'),
(16, 5, 'F', 'altura: 0.76m'),
(16, 6, 'M', 'altura: 0.99m'),
(16, 6, 'F', 'altura: 0.84m'),
(16, 7, 'M', 'altura: 1.067m'),
(16, 7, 'F', 'altura: 0.84m'),
(16, 8, 'M', 'altura: 1.067m'),
(16, 8, 'F', 'altura: 0.84m'),
-- 100m vallas (id 18) — solo F
(18, 4, 'F', 'altura: 0.76m'),
(18, 5, 'F', 'altura: 0.76m'),
(18, 6, 'F', 'altura: 0.84m'),
(18, 7, 'F', 'altura: 0.84m'),
(18, 8, 'F', 'altura: 0.84m'),
-- 110m vallas (id 19) — solo M
(19, 5, 'M', 'altura: 0.91m'),
(19, 6, 'M', 'altura: 0.99m'),
(19, 7, 'M', 'altura: 1.067m'),
(19, 8, 'M', 'altura: 1.067m'),
-- 400m vallas (id 2)
( 2, 5,  'M', 'altura: 0.84m'),
( 2, 6,  'M', 'altura: 0.91m'),
( 2, 7,  'M', 'altura: 0.91m'),
( 2, 8,  'M', 'altura: 0.91m'),
( 2, 9,  'M', 'altura: 0.91m'),
( 2, 11, 'M', 'altura: 0.91m'),
( 2, 13, 'M', 'altura: 0.84m'),
( 2, 15, 'M', 'altura: 0.76m'),
( 2, 17, 'M', 'altura: 0.76m'),
( 2, 19, 'M', 'altura: 0.686m'),
( 2, 21, 'M', 'altura: 0.686m'),
( 2, 5,  'F', 'altura: 0.76m'),
( 2, 6,  'F', 'altura: 0.76m'),
( 2, 7,  'F', 'altura: 0.76m'),
( 2, 8,  'F', 'altura: 0.76m'),
( 2, 10, 'F', 'altura: 0.76m'),
( 2, 12, 'F', 'altura: 0.76m'),
( 2, 14, 'F', 'altura: 0.76m'),
( 2, 16, 'F', 'altura: 0.686m'),
( 2, 18, 'F', 'altura: 0.686m'),
( 2, 20, 'F', 'altura: 0.686m'),
( 2, 22, 'F', 'altura: 0.686m');

-- 50m lisos (id 3) — Sub-10 y Sub-12
INSERT INTO `pruebas_variantes` (`id_prueba`, `id_categoria`, `genero_aplicable`) VALUES
(3, 1, 'M'), (3, 1, 'F'), (3, 2, 'M'), (3, 2, 'F');

-- 80m lisos (id 5) — Sub-12
INSERT INTO `pruebas_variantes` (`id_prueba`, `id_categoria`, `genero_aplicable`) VALUES
(5, 2, 'M'), (5, 2, 'F');

-- Variantes de lanzamientos
INSERT INTO `pruebas_variantes` (`id_prueba`, `id_categoria`, `genero_aplicable`, `especificaciones`) VALUES
-- Lanzamiento de peso (id 28)
(28, 3,  'M', 'peso: 3kg'),
(28, 4,  'M', 'peso: 4kg'),
(28, 5,  'M', 'peso: 5kg'),
(28, 6,  'M', 'peso: 6kg'),
(28, 7,  'M', 'peso: 7.26kg'),
(28, 8,  'M', 'peso: 7.26kg'),
(28, 9,  'M', 'peso: 7.26kg'),
(28, 11, 'M', 'peso: 7.26kg'),
(28, 13, 'M', 'peso: 7.26kg'),
(28, 15, 'M', 'peso: 6kg'),
(28, 17, 'M', 'peso: 6kg'),
(28, 19, 'M', 'peso: 5kg'),
(28, 21, 'M', 'peso: 5kg'),
(28, 3,  'F', 'peso: 3kg'),
(28, 4,  'F', 'peso: 3kg'),
(28, 5,  'F', 'peso: 3kg'),
(28, 6,  'F', 'peso: 4kg'),
(28, 7,  'F', 'peso: 4kg'),
(28, 8,  'F', 'peso: 4kg'),
(28, 10, 'F', 'peso: 4kg'),
(28, 12, 'F', 'peso: 4kg'),
(28, 14, 'F', 'peso: 4kg'),
(28, 16, 'F', 'peso: 3kg'),
(28, 18, 'F', 'peso: 3kg'),
(28, 20, 'F', 'peso: 3kg'),
(28, 22, 'F', 'peso: 3kg'),
-- Lanzamiento de disco (id 29)
(29, 3,  'M', 'peso: 800g'),
(29, 4,  'M', 'peso: 1kg'),
(29, 5,  'M', 'peso: 1.5kg'),
(29, 6,  'M', 'peso: 1.75kg'),
(29, 7,  'M', 'peso: 2kg'),
(29, 8,  'M', 'peso: 2kg'),
(29, 9,  'M', 'peso: 2kg'),
(29, 11, 'M', 'peso: 2kg'),
(29, 13, 'M', 'peso: 2kg'),
(29, 15, 'M', 'peso: 1.5kg'),
(29, 17, 'M', 'peso: 1.5kg'),
(29, 19, 'M', 'peso: 1kg'),
(29, 21, 'M', 'peso: 1kg'),
(29, 3,  'F', 'peso: 800g'),
(29, 4,  'F', 'peso: 800g'),
(29, 5,  'F', 'peso: 1kg'),
(29, 6,  'F', 'peso: 1kg'),
(29, 7,  'F', 'peso: 1kg'),
(29, 8,  'F', 'peso: 1kg'),
(29, 10, 'F', 'peso: 1kg'),
(29, 12, 'F', 'peso: 1kg'),
(29, 14, 'F', 'peso: 1kg'),
(29, 16, 'F', 'peso: 1kg'),
(29, 18, 'F', 'peso: 1kg'),
(29, 20, 'F', 'peso: 1kg'),
(29, 22, 'F', 'peso: 1kg'),
-- Lanzamiento de jabalina (id 30)
(30, 3,  'M', 'peso: 500g'),
(30, 4,  'M', 'peso: 600g'),
(30, 5,  'M', 'peso: 700g'),
(30, 6,  'M', 'peso: 800g'),
(30, 7,  'M', 'peso: 800g'),
(30, 8,  'M', 'peso: 800g'),
(30, 9,  'M', 'peso: 800g'),
(30, 11, 'M', 'peso: 800g'),
(30, 13, 'M', 'peso: 800g'),
(30, 15, 'M', 'peso: 700g'),
(30, 17, 'M', 'peso: 700g'),
(30, 19, 'M', 'peso: 600g'),
(30, 21, 'M', 'peso: 600g'),
(30, 3,  'F', 'peso: 400g'),
(30, 4,  'F', 'peso: 500g'),
(30, 5,  'F', 'peso: 500g'),
(30, 6,  'F', 'peso: 600g'),
(30, 7,  'F', 'peso: 600g'),
(30, 8,  'F', 'peso: 600g'),
(30, 10, 'F', 'peso: 600g'),
(30, 12, 'F', 'peso: 600g'),
(30, 14, 'F', 'peso: 600g'),
(30, 16, 'F', 'peso: 500g'),
(30, 18, 'F', 'peso: 500g'),
(30, 20, 'F', 'peso: 500g'),
(30, 22, 'F', 'peso: 500g'),
-- Lanzamiento de martillo (id 31)
(31, 4,  'M', 'peso: 4kg'),
(31, 5,  'M', 'peso: 5kg'),
(31, 6,  'M', 'peso: 6kg'),
(31, 7,  'M', 'peso: 7.26kg'),
(31, 8,  'M', 'peso: 7.26kg'),
(31, 9,  'M', 'peso: 7.26kg'),
(31, 11, 'M', 'peso: 7.26kg'),
(31, 13, 'M', 'peso: 7.26kg'),
(31, 15, 'M', 'peso: 6kg'),
(31, 17, 'M', 'peso: 6kg'),
(31, 19, 'M', 'peso: 5kg'),
(31, 21, 'M', 'peso: 5kg'),
(31, 4,  'F', 'peso: 3kg'),
(31, 5,  'F', 'peso: 3kg'),
(31, 6,  'F', 'peso: 4kg'),
(31, 7,  'F', 'peso: 4kg'),
(31, 8,  'F', 'peso: 4kg'),
(31, 10, 'F', 'peso: 4kg'),
(31, 12, 'F', 'peso: 4kg'),
(31, 14, 'F', 'peso: 4kg'),
(31, 16, 'F', 'peso: 3kg'),
(31, 18, 'F', 'peso: 3kg'),
(31, 20, 'F', 'peso: 3kg'),
(31, 22, 'F', 'peso: 3kg');

-- ========================================================
-- USUARIO ADMINISTRADOR POR DEFECTO
-- Contraseña: password
-- ========================================================
INSERT INTO `usuarios` (`id_categoria`, `nombre`, `apellidos`, `dni`, `email`, `password_hash`, `rol`, `fecha_nacimiento`, `genero`, `estado_cuenta`) VALUES
(NULL, 'Admin', 'Ianuarius', '00000000A', 'admin@ianuarius.com', '$2y$12$IwbfV5lhLBrPsPVSuLB1q.H1EM5GxHIltCOj.xIaVfhEcoSKtCS7y', 'Admin', '2000-01-01', 'M', 1);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
