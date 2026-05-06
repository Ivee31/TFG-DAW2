<?php

class PruebaController {

    // devuelve las pruebas disponibles para el usuario en sesion:
    // - pruebas con variante definida para su categoria + genero
    // - pruebas sin ninguna variante (carreras lisas, saltos, marcha — universales)
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

            $edad   = (int)date('Y') - (int)date('Y', strtotime($user['fecha_nacimiento']));
            $genero = $user['genero'];

            // categoria natural (misma logica que CategoriaController)
            $stmtCat = $pdo->prepare(
                "SELECT id_categoria FROM categorias
                 WHERE edad_min <= :edad AND edad_max >= :edad
                   AND nombre != 'Absoluta'
                   AND (genero IS NULL OR genero = :genero)
                 LIMIT 1"
            );
            $stmtCat->bindParam(':edad',   $edad,   PDO::PARAM_INT);
            $stmtCat->bindParam(':genero', $genero, PDO::PARAM_STR);
            $stmtCat->execute();
            $cat = $stmtCat->fetch(PDO::FETCH_ASSOC);
            $id_categoria = $cat ? (int)$cat['id_categoria'] : null;

            $stmtP = $pdo->prepare(
                "SELECT p.id_prueba, p.nombre_prueba, p.tipo, pv.especificaciones
                 FROM pruebas p
                 LEFT JOIN pruebas_variantes pv
                        ON pv.id_prueba        = p.id_prueba
                       AND pv.id_categoria     = :id_categoria
                       AND pv.genero_aplicable = :genero
                 WHERE pv.id_prueba IS NOT NULL
                    OR NOT EXISTS (
                        SELECT 1 FROM pruebas_variantes pv2
                        WHERE pv2.id_prueba = p.id_prueba
                    )
                 ORDER BY p.tipo ASC, p.nombre_prueba ASC"
            );
            $stmtP->bindValue(':id_categoria', $id_categoria, $id_categoria !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmtP->bindParam(':genero',       $genero,       PDO::PARAM_STR);
            $stmtP->execute();

            $pruebas = $stmtP->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode(["status" => "success", "pruebas" => $pruebas]);

        } catch (PDOException $e) {
            error_log("pruebas.disponibles() - " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
