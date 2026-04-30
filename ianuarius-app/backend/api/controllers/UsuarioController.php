<?php

class UsuarioController {

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
