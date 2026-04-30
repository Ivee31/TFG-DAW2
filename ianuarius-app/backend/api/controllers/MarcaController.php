<?php

class MarcaController {

    // regex formato MM'SS"ms (ej: 00'49"15)
    const FORMATO_MARCA = "/^\d{2}'\d{2}\"\d{2}$/";

    // valores permitidos para tipo_competicion
    const TIPOS_COMPETICION = ['Nacional', 'Autonomico CyL', 'Provincial', 'Escolar', 'Control'];

    // guarda nueva marca del atleta autenticado
    public static function guardar() {
        session_start();
        
        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['prueba']) || !isset($input['temporada']) || !isset($input['marca']) || !isset($input['tipo_competicion'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Datos incompletos"]);
            return;
        }

        $id_usuario = $_SESSION['id_usuario'];
        $prueba = trim($input['prueba']);
        $temporada = trim($input['temporada']);
        $tipo_competicion = trim($input['tipo_competicion']);
        $marca = trim($input['marca']);

        // validar formato de tiempo MM'SS"ms
        if (!preg_match(self::FORMATO_MARCA, $marca)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "error" => "Formato incorrecto. Usa MM'SS\"ms (ej: 00'49\"15)"]);
            return;
        }

        // validar tipo_competicion
        if (!in_array($tipo_competicion, self::TIPOS_COMPETICION)) {
            http_response_code(422);
            echo json_encode(["status" => "error", "error" => "Tipo de competicion no valido"]);
            return;
        }

        $id_categoria = isset($input['id_categoria']) && $input['id_categoria'] !== '' ? (int)$input['id_categoria'] : null;

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "INSERT INTO marcas (id_usuario, id_categoria, prueba, temporada, tipo_competicion, marca, fecha)
                 VALUES (:id_usuario, :id_categoria, :prueba, :temporada, :tipo_competicion, :marca, CURDATE())"
            );

            $stmt->bindParam(':id_usuario',       $id_usuario,       PDO::PARAM_INT);
            $stmt->bindParam(':id_categoria',      $id_categoria,     PDO::PARAM_INT);
            $stmt->bindParam(':prueba',            $prueba,           PDO::PARAM_STR);
            $stmt->bindParam(':temporada',         $temporada,        PDO::PARAM_STR);
            $stmt->bindParam(':tipo_competicion',  $tipo_competicion, PDO::PARAM_STR);
            $stmt->bindParam(':marca',             $marca,            PDO::PARAM_STR);
            $stmt->execute();

            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Marca guardada correctamente"]);

        } catch (PDOException $e) {
            error_log("guardar() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno al guardar la marca"]);
        }
    }

    // devuelve las marcas del usuario autenticado
    public static function listar() {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        $id_usuario = $_SESSION['id_usuario'];

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT m.id_marca, m.prueba, m.temporada, m.tipo_competicion, m.marca, m.fecha,
                        c.nombre AS categoria_nombre
                 FROM marcas m
                 LEFT JOIN categorias c ON m.id_categoria = c.id_categoria
                 WHERE m.id_usuario = :id_usuario
                 ORDER BY m.fecha DESC, m.id_marca DESC"
            );
            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->execute();

            $marcas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(["status" => "success", "marcas" => $marcas]);

        } catch (PDOException $e) {
            error_log("listar() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno al obtener marcas"]);
        }
    }

    // elimina una marca — solo si pertenece al usuario en sesion
    public static function eliminar($id_marca) {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        if (!$id_marca || $id_marca < 1) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "ID de marca no valido"]);
            return;
        }

        $id_usuario = $_SESSION['id_usuario'];

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "DELETE FROM marcas WHERE id_marca = :id_marca AND id_usuario = :id_usuario"
            );

            $stmt->bindParam(':id_marca',   $id_marca,   PDO::PARAM_INT);
            $stmt->bindParam(':id_usuario', $id_usuario, PDO::PARAM_INT);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode(["status" => "success", "message" => "Marca eliminada"]);

            }else {
                // no encontrada o no pertenece al usuario
                http_response_code(404);
                echo json_encode(["status" => "error", "error" => "Marca no encontrada"]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno al eliminar la marca"]);
        }
    }
}
