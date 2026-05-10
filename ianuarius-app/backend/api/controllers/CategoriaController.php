<?php

class CategoriaController {

    // devuelve las categorias disponibles para el usuario en sesion:
    // su categoria natural (segun edad y genero) + Absoluta
    public static function disponibles() {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT fecha_nacimiento, genero FROM usuarios WHERE id_usuario = :id"
            );
            $stmt->bindParam(':id', $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                http_response_code(404);
                echo json_encode(["status" => "error", "error" => "Usuario no encontrado"]);
                return;
            }

            // En atletismo la categoria se calcula por año de nacimiento
            $edad  = (int)date('Y') - (int)date('Y', strtotime($user['fecha_nacimiento']));
            $genero = $user['genero'];

            // Categoria natural: no-Absoluta que encaje con la edad y genero
            $stmt2 = $pdo->prepare(
                "SELECT id_categoria, nombre FROM categorias
                 WHERE edad_min <= :edad AND edad_max >= :edad
                   AND nombre != 'Absoluta'
                   AND (genero IS NULL OR genero = :genero)
                 LIMIT 1"
            );
            $stmt2->bindParam(':edad',   $edad,   PDO::PARAM_INT);
            $stmt2->bindParam(':genero', $genero, PDO::PARAM_STR);
            $stmt2->execute();
            $natural = $stmt2->fetch(PDO::FETCH_ASSOC);

            // Absoluta — siempre disponible como opcion alternativa
            $stmt3 = $pdo->prepare(
                "SELECT id_categoria, nombre FROM categorias WHERE nombre = 'Absoluta'"
            );
            $stmt3->execute();
            $absoluta = $stmt3->fetch(PDO::FETCH_ASSOC);

            $categorias = [];
            if ($natural)   $categorias[] = $natural;
            if ($absoluta)  $categorias[] = $absoluta;

            http_response_code(200);
            echo json_encode(["status" => "success", "categorias" => $categorias]);

        } catch (PDOException $e) {
            error_log("categorias.disponibles() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    // devuelve todas las categorias — solo Entrenador / Admin
    public static function todas() {
        session_start();

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

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->query("SELECT id_categoria, nombre FROM categorias ORDER BY edad_min ASC, nombre ASC");
            $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "categorias" => $categorias]);

        } catch (PDOException $e) {
            error_log("categorias.todas() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
