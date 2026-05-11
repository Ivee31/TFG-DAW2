<?php

class AdminController {

    public static function pendientes() {
        session_start();

        if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT id_usuario, nombre, apellidos, email, fecha_nacimiento
                 FROM usuarios
                 WHERE rol = 'Entrenador' AND estado_cuenta = 0
                 ORDER BY id_usuario ASC"
            );
            $stmt->execute();
            $pendientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(["status" => "success", "pendientes" => $pendientes]);

        } catch (PDOException $e) {
            error_log("AdminController.pendientes() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function subirPlantilla(): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $pdf   = trim($input['pdf'] ?? '');

        if (!$pdf || strpos($pdf, 'data:application/pdf') !== 0) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Formato no válido (PDF requerido)"]);
            return;
        }

        if (strlen($pdf) > 10000000) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Archivo demasiado grande (máx. ~7 MB)"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "INSERT INTO configuracion_club (clave, valor)
                 VALUES ('plantilla_inscripcion', :val)
                 ON DUPLICATE KEY UPDATE valor = :val2, actualizado_en = NOW()"
            );
            $stmt->bindParam(':val',  $pdf, PDO::PARAM_STR);
            $stmt->bindParam(':val2', $pdf, PDO::PARAM_STR);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function obtenerPlantilla(): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("SELECT valor FROM configuracion_club WHERE clave = 'plantilla_inscripcion'");
            $stmt->execute();
            $row  = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(404);
                echo json_encode(["status" => "error", "error" => "Sin plantilla"]);
                return;
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "pdf" => $row['valor']]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function marcarPago(int $id): void {
        if (session_status() === PHP_SESSION_NONE) session_start();

        if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        if ($id < 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "ID no válido"]);
            return;
        }

        $input   = json_decode(file_get_contents('php://input'), true);
        $pagado  = ($input['pagado'] ?? false) ? 'pagado' : 'pendiente';
        $temporada = date('Y') . '/' . (date('Y') + 1);

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "INSERT INTO fichas_inscripcion (id_usuario, temporada, estado_pago)
                 VALUES (:id, :temporada, :estado)
                 ON DUPLICATE KEY UPDATE estado_pago = :estado2"
            );
            $stmt->bindValue(':id',        $id,        PDO::PARAM_INT);
            $stmt->bindValue(':temporada', $temporada, PDO::PARAM_STR);
            $stmt->bindValue(':estado',    $pagado,    PDO::PARAM_STR);
            $stmt->bindValue(':estado2',   $pagado,    PDO::PARAM_STR);
            $stmt->execute();

            http_response_code(200);
            echo json_encode(["status" => "success", "estado_pago" => $pagado]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function activar($id_usuario) {
        session_start();

        if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Admin') {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Acceso denegado"]);
            return;
        }

        if (!$id_usuario || $id_usuario < 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "ID no válido"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "UPDATE usuarios SET estado_cuenta = 1
                 WHERE id_usuario = :id AND rol = 'Entrenador' AND estado_cuenta = 0"
            );
            $stmt->bindParam(':id', $id_usuario, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(["status" => "success", "message" => "Cuenta activada"]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "error" => "Cuenta no encontrada o ya activa"]);
            }

        } catch (PDOException $e) {
            error_log("AdminController.activar() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
