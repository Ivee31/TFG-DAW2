<?php

class UsuarioController {

    public static function cambiarEmail() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Email no válido"]);
            return;
        }

        try {
            $pdo = Connect::conexion();

            $check = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email AND id_usuario != :id");
            $check->bindParam(':email', $email, PDO::PARAM_STR);
            $check->bindParam(':id',    $_SESSION['id_usuario'], PDO::PARAM_INT);
            $check->execute();
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "error" => "Email ya en uso"]);
                return;
            }

            $stmt = $pdo->prepare("UPDATE usuarios SET email = :email WHERE id_usuario = :id");
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->bindParam(':id',    $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success", "email" => $email]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function subirFoto() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $foto  = trim($input['foto'] ?? '');

        if (!$foto || strpos($foto, 'data:image/') !== 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Imagen no válida"]);
            return;
        }

        if (strlen($foto) > 600000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Imagen demasiado grande (máx. ~450KB)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("UPDATE usuarios SET foto_perfil = :foto WHERE id_usuario = :id");
            $stmt->bindParam(':foto', $foto, PDO::PARAM_STR);
            $stmt->bindParam(':id',   $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function actualizarPerfil() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input     = json_decode(file_get_contents('php://input'), true);
        $nombre    = trim($input['nombre'] ?? '');
        $apellidos = trim($input['apellidos'] ?? '');
        $genero    = trim($input['genero'] ?? '');
        $fecha     = trim($input['fecha_nacimiento'] ?? '');

        if (!$nombre || !$apellidos || !in_array($genero, ['M', 'F']) || !$fecha) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Datos incompletos"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "UPDATE usuarios SET nombre = :nombre, apellidos = :apellidos, genero = :genero, fecha_nacimiento = :fecha
                 WHERE id_usuario = :id"
            );
            $stmt->bindParam(':nombre',    $nombre,    PDO::PARAM_STR);
            $stmt->bindParam(':apellidos', $apellidos, PDO::PARAM_STR);
            $stmt->bindParam(':genero',    $genero,    PDO::PARAM_STR);
            $stmt->bindParam(':fecha',     $fecha,     PDO::PARAM_STR);
            $stmt->bindParam(':id',        $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode([
                "status"           => "success",
                "nombre"           => $nombre,
                "apellidos"        => $apellidos,
                "genero"           => $genero,
                "fecha_nacimiento" => $fecha
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function cambiarPassword() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input  = json_decode(file_get_contents('php://input'), true);
        $actual = trim($input['password_actual'] ?? '');
        $nueva  = trim($input['nueva_password'] ?? '');

        if (!$actual || !$nueva || strlen($nueva) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Datos incompletos o contraseña muy corta (mín. 6 caracteres)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("SELECT password_hash FROM usuarios WHERE id_usuario = :id");
            $stmt->bindParam(':id', $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();
            $row  = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row || !password_verify($actual, $row['password_hash'])) {
                http_response_code(401);
                echo json_encode(["status" => "error", "error" => "Contraseña actual incorrecta"]);
                return;
            }

            $hash = password_hash($nueva, PASSWORD_DEFAULT);
            $upd  = $pdo->prepare("UPDATE usuarios SET password_hash = :hash WHERE id_usuario = :id");
            $upd->bindParam(':hash', $hash, PDO::PARAM_STR);
            $upd->bindParam(':id',   $_SESSION['id_usuario'], PDO::PARAM_INT);
            $upd->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function subirDni() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $foto  = trim($input['foto'] ?? '');

        if (!$foto || (strpos($foto, 'data:image/') !== 0 && strpos($foto, 'data:application/pdf') !== 0)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Formato no válido (imagen o PDF)"]);
            return;
        }

        if (strlen($foto) > 3000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Archivo demasiado grande (máx. ~2,2 MB)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("UPDATE usuarios SET foto_dni = :foto WHERE id_usuario = :id");
            $stmt->bindParam(':foto', $foto, PDO::PARAM_STR);
            $stmt->bindParam(':id',   $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function subirCarnet() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $foto  = trim($input['foto'] ?? '');

        if (!$foto || strpos($foto, 'data:image/') !== 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Imagen no válida"]);
            return;
        }

        if (strlen($foto) > 600000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Imagen demasiado grande (máx. ~450 KB)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("UPDATE usuarios SET foto_carnet = :foto WHERE id_usuario = :id");
            $stmt->bindParam(':foto', $foto, PDO::PARAM_STR);
            $stmt->bindParam(':id',   $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function subirInscripcionPdf() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $foto  = trim($input['foto'] ?? '');

        if (!$foto || (strpos($foto, 'data:image/') !== 0 && strpos($foto, 'data:application/pdf') !== 0)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Formato no válido (PDF o imagen)"]);
            return;
        }

        if (strlen($foto) > 5000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Archivo demasiado grande (máx. ~3,7 MB)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("UPDATE usuarios SET inscripcion_pdf = :foto WHERE id_usuario = :id");
            $stmt->bindParam(':foto', $foto, PDO::PARAM_STR);
            $stmt->bindParam(':id',   $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function listarAtletas() {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $rol = $_SESSION['rol'] ?? '';
        if (!in_array($rol, ['Entrenador', 'Admin'])) {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT u.id_usuario, u.nombre, u.apellidos, u.email, u.genero, u.fecha_nacimiento,
                        u.foto_perfil, u.foto_carnet,
                        COUNT(m.id_marca) AS total_marcas
                 FROM usuarios u
                 LEFT JOIN marcas m ON u.id_usuario = m.id_usuario
                 WHERE u.rol = 'Atleta' AND u.estado_cuenta = 1
                 GROUP BY u.id_usuario
                 ORDER BY u.apellidos, u.nombre"
            );
            $stmt->execute();
            $atletas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(["status" => "success", "atletas" => $atletas]);

        } catch (PDOException $e) {
            error_log("UsuarioController.listarAtletas() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function listarEntrenadores() {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        if ($_SESSION['rol'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT id_usuario, nombre, apellidos, email, genero, fecha_nacimiento, foto_perfil, foto_carnet
                 FROM usuarios
                 WHERE rol = 'Entrenador' AND estado_cuenta = 1
                 ORDER BY apellidos, nombre"
            );
            $stmt->execute();
            $entrenadores = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(["status" => "success", "entrenadores" => $entrenadores]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
