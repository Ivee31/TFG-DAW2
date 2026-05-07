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
}
