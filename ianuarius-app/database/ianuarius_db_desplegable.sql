-- Creación de la base de datos

-- 1. Tabla categorias (Basada en apartado 3.4.1 de la memoria)
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    edad_min INT NOT NULL,
    edad_max INT NOT NULL
);

-- 2. Tabla pruebas (Basada en apartado 3.4.2 de la memoria)
CREATE TABLE pruebas (
    id_prueba INT AUTO_INCREMENT PRIMARY KEY,
    nombre_prueba VARCHAR(50) NOT NULL,
    tipo ENUM('Carrera', 'Salto', 'Lanzamiento') NOT NULL
);

-- 3. Tabla pruebas_variantes (Basada en apartado 3.4.3 de la memoria)
CREATE TABLE pruebas_variantes (
    id_variante INT AUTO_INCREMENT PRIMARY KEY,
    id_prueba INT NOT NULL,
    id_categoria INT NOT NULL,
    genero_aplicable ENUM('M', 'F', 'Ambos') NOT NULL,
    especificaciones VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (id_prueba) REFERENCES pruebas(id_prueba) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- 4. Tabla usuarios (Basada en apartado 3.4.4 de la memoria)
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT DEFAULT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(9) UNIQUE DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'Entrenador', 'Atleta') DEFAULT 'Atleta',
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('M', 'F') NOT NULL,
    estado_cuenta BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- 5. Tabla fichas_inscripcion (Basada en apartado 3.4.5 de la memoria)
CREATE TABLE fichas_inscripcion (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    temporada VARCHAR(20) NOT NULL,
    estado_validacion ENUM('pendiente', 'validado', 'error_dni') DEFAULT 'pendiente',
    estado_pago ENUM('pendiente', 'pagado') DEFAULT 'pendiente',
    ruta_pdf VARCHAR(255) DEFAULT NULL,
    ruta_dni VARCHAR(255) DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 6. Tabla feedback_entrenamientos (Basada en apartado 3.4.6 de la memoria)
CREATE TABLE feedback_entrenamientos (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha DATE NOT NULL,
    sesion_realizada TEXT NOT NULL,
    sensaciones TEXT DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 7. Tabla eventos_calendario (Basada en apartado 3.4.7 de la memoria)
CREATE TABLE eventos_calendario (
    id_evento INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_categoria INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_hora DATETIME NOT NULL,
    tipo_evento ENUM('nacional', 'autonomico', 'provincial', 'control', 'escolares') NOT NULL,
    tipo_pista ENUM('aire libre', 'pista cubierta', 'cross') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- ==========================================
-- DATOS DE PRUEBA (SEED) - Para cumplir rúbrica
-- ==========================================

-- Insertar categorías
INSERT INTO categorias (nombre, edad_min, edad_max) VALUES 
('Sub-18', 16, 17),
('Sub-20', 18, 19),
('Sub-23', 20, 22),
('Absoluta', 23, 99);

-- Insertar pruebas
INSERT INTO pruebas (nombre_prueba, tipo) VALUES 
('400m lisos', 'Carrera'),
('400m vallas', 'Carrera');

-- Insertar variantes (Ej: Vallas a 0.91m para Sub-20 Masculino)
INSERT INTO pruebas_variantes (id_prueba, id_categoria, genero_aplicable, especificaciones) VALUES 
(2, 2, 'M', 'Altura valla: 0.91m');

-- Insertar usuarios de prueba (Contraseñas sin cifrar por ahora para que puedas probar el login más fácil en desarrollo)
INSERT INTO usuarios (id_categoria, nombre, apellidos, dni, email, password_hash, rol, fecha_nacimiento, genero, estado_cuenta) VALUES 
(NULL, 'Ivan', 'Admin', '00000000A', 'admin@ianuarius.com', 'admin123', 'Admin', '2004-10-31', 'M', TRUE),
(3, 'Iván', 'Martín Nieto', '70910314A', 'ivan@ianuarius.com', 'atleta123', 'Atleta', '2004-04-15', 'M', TRUE);

-- Insertar una inscripción de prueba
INSERT INTO fichas_inscripcion (id_usuario, temporada, estado_validacion, estado_pago) VALUES
(2, '2025/2026', 'validado', 'pagado');

-- 8. Tabla marcas (tiempos registrados por los atletas)
-- formato marca: MM'SS''ms  (ej: 00'49''15)
CREATE TABLE IF NOT EXISTS marcas (
    id_marca         INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    prueba           VARCHAR(50) NOT NULL,
    temporada        ENUM('short_track', 'outdoor') NOT NULL,
    tipo_competicion ENUM('Nacional','Autonomico CyL','Provincial','Escolar','Control') NOT NULL DEFAULT 'Control',
    marca            VARCHAR(20) NOT NULL,
    fecha            DATE NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
