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
