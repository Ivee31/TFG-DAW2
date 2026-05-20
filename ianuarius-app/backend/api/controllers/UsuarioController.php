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

        // Whitelist estricta de prefijos aceptados (SVG excluido — puede contener JS)
        $tipos_permitidos = [
            'data:application/pdf;base64,' => 'pdf',
            'data:image/jpeg;base64,'      => 'jpeg',
            'data:image/png;base64,'       => 'png',
            'data:image/webp;base64,'      => 'webp',
        ];

        $tipo_detectado = null;
        $b64payload     = null;
        foreach ($tipos_permitidos as $prefijo => $tipo) {
            if (strncmp($foto, $prefijo, strlen($prefijo)) === 0) {
                $tipo_detectado = $tipo;
                $b64payload     = substr($foto, strlen($prefijo));
                break;
            }
        }

        if (!$tipo_detectado) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Formato no válido (PDF, JPEG, PNG o WebP)"]);
            return;
        }

        if (strlen($foto) > 5000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Archivo demasiado grande (máx. ~3,7 MB)"]);
            return;
        }

        // Verificar magic bytes según el tipo declarado
        $bytes = base64_decode(substr($b64payload, 0, 20), true);
        if ($bytes === false) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Archivo corrupto o inválido"]);
            return;
        }
        $magic_ok = false;
        if ($tipo_detectado === 'pdf')  $magic_ok = strncmp($bytes, '%PDF-', 5) === 0;
        if ($tipo_detectado === 'jpeg') $magic_ok = substr($bytes, 0, 3) === "\xFF\xD8\xFF";
        if ($tipo_detectado === 'png')  $magic_ok = substr($bytes, 0, 8) === "\x89PNG\r\n\x1A\n";
        if ($tipo_detectado === 'webp') $magic_ok = substr($bytes, 0, 4) === 'RIFF' && substr($bytes, 8, 4) === 'WEBP';

        if (!$magic_ok) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "El contenido del archivo no coincide con su tipo"]);
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

    public static function eliminarArchivo(string $campo): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $permitidos = ['foto_dni', 'foto_carnet', 'inscripcion_pdf'];
        if (!in_array($campo, $permitidos, true)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Campo no válido"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("UPDATE usuarios SET {$campo} = NULL WHERE id_usuario = :id");
            $stmt->bindParam(':id', $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function eliminarCuenta(): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $id = (int)$_SESSION['id_usuario'];

        try {
            $pdo = Connect::conexion();

            $stmt = $pdo->prepare("SELECT email FROM usuarios WHERE id_usuario = :id");
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row) {
                $pdo->prepare("DELETE FROM password_resets WHERE email = :email")
                    ->execute([':email' => $row['email']]);
            }

            $pdo->prepare("DELETE FROM usuarios WHERE id_usuario = :id")
                ->execute([':id' => $id]);

            session_destroy();
            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function listarAtletas() {
        if (session_status() === PHP_SESSION_NONE) session_start();

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
                        (u.foto_dni IS NOT NULL) AS tiene_dni,
                        (u.foto_carnet IS NOT NULL) AS tiene_carnet,
                        (u.inscripcion_pdf IS NOT NULL OR u.inscripcion_formulario IS NOT NULL) AS tiene_inscripcion,
                        COUNT(m.id_marca) AS total_marcas,
                        COALESCE(fi.estado_pago, 'pendiente') AS estado_pago
                 FROM usuarios u
                 LEFT JOIN marcas m ON u.id_usuario = m.id_usuario
                 LEFT JOIN fichas_inscripcion fi ON u.id_usuario = fi.id_usuario
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

    // devuelve perfil completo de un atleta (incluye documentos) — solo Entrenador / Admin
    public static function perfilAtleta(int $id): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        if (!in_array($_SESSION['rol'], ['Entrenador', 'Admin'])) {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        if ($id < 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "ID no válido"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();

            // Admin puede ver cualquier usuario; Entrenador solo atletas
            $rolFiltro = ($_SESSION['rol'] === 'Admin') ? '' : "AND rol = 'Atleta'";
            $stmt = $pdo->prepare(
                "SELECT id_usuario, nombre, apellidos, email, genero, fecha_nacimiento,
                        foto_perfil, foto_carnet, foto_dni, inscripcion_pdf
                 FROM usuarios
                 WHERE id_usuario = :id $rolFiltro AND estado_cuenta = 1"
            );
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            $atleta = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$atleta) {
                http_response_code(404);
                echo json_encode(["status" => "error", "error" => "Usuario no encontrado"]);
                return;
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "atleta" => $atleta]);

        } catch (PDOException $e) {
            error_log("perfilAtleta() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function toggleNotificaciones(): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input     = json_decode(file_get_contents('php://input'), true);
        $frecuenciasValidas = ['muy_alta', 'alta', 'baja'];

        $campos = [];
        $params = [':id' => $_SESSION['id_usuario']];

        if (array_key_exists('activo', $input)) {
            $campos[]            = 'notificaciones_email = :activo';
            $params[':activo']   = (int)(bool)$input['activo'];
        }

        if (isset($input['frecuencia']) && in_array($input['frecuencia'], $frecuenciasValidas)) {
            $campos[]              = 'frecuencia_notif = :frecuencia';
            $params[':frecuencia'] = $input['frecuencia'];
        }

        if (empty($campos)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Sin campos a actualizar"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $sql  = "UPDATE usuarios SET " . implode(', ', $campos) . " WHERE id_usuario = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
