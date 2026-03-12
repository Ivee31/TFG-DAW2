-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS ianuarius_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ianuarius_db;

-- 1. Tabla categorias
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    edad_min INT NOT NULL,
    edad_max INT NOT NULL
);

-- 2. Tabla pruebas
CREATE TABLE pruebas (
    id_prueba INT AUTO_INCREMENT PRIMARY KEY,
    nombre_prueba VARCHAR(50) NOT NULL,
    tipo ENUM('Carrera', 'Salto', 'Lanzamiento') NOT NULL
);

-- 3. Tabla pruebas_variantes
CREATE TABLE pruebas_variantes (
    id_variante INT AUTO_INCREMENT PRIMARY KEY,
    id_prueba INT NOT NULL,
    id_categoria INT NOT NULL,
    genero_aplicable ENUM('M', 'F', 'Ambos') NOT NULL,
    especificaciones VARCHAR(100) DEFAULT NULL,
    FOREIGN KEY (id_prueba) REFERENCES pruebas(id_prueba) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- 4. Tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT DEFAULT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(9) UNIQUE DEFAULT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('Admin', 'Atleta') DEFAULT 'Atleta',
    fecha_nacimiento DATE NOT NULL,
    genero ENUM('M', 'F') NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- 5. Tabla fichas_inscripcion (1:1 con usuarios)
CREATE TABLE fichas_inscripcion (
    id_ficha INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    ruta_pdf VARCHAR(255) DEFAULT NULL,
    ruta_dni VARCHAR(255) DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 6. Tabla feedback_entrenamientos (1:N)
CREATE TABLE feedback_entrenamientos (
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_variante INT NOT NULL,
    fecha DATE NOT NULL,
    sensaciones TEXT DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_variante) REFERENCES pruebas_variantes(id_variante) ON DELETE CASCADE
);
