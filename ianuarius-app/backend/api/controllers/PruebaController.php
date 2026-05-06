<?php

class PruebaController {

    // devuelve las pruebas disponibles para el usuario en sesion:
    // - si usuario es Absoluta/sin categoria: su variante propia + universales
    // - si no-Absoluta: variante propia + variante Absoluta del mismo genero (cuando la prueba
    //   tambien tiene variante para su categoria) + universales
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

            // categoria natural (excluye Absoluta para que mayores de 34 caigan en Masters)
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

            // id de Absoluta
            $stmtAbs = $pdo->query("SELECT id_categoria FROM categorias WHERE nombre = 'Absoluta' LIMIT 1");
            $absRow  = $stmtAbs->fetch(PDO::FETCH_ASSOC);
            $id_absoluta = $absRow ? (int)$absRow['id_categoria'] : null;

            $is_absoluta = ($id_categoria !== null && $id_categoria === $id_absoluta);

            if ($is_absoluta || $id_categoria === null) {
                // Absoluta o sin categoria: variante propia + universales
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
                $stmtP->bindParam(':genero', $genero, PDO::PARAM_STR);

            } else {
                // No-Absoluta: variante propia
                //            + variante Absoluta (solo si la prueba tambien tiene variante propia)
                //            + universales (pruebas sin ninguna variante)
                $stmtP = $pdo->prepare(
                    "SELECT p.id_prueba, p.nombre_prueba, p.tipo, pv.especificaciones
                     FROM pruebas p
                     INNER JOIN pruebas_variantes pv
                             ON pv.id_prueba        = p.id_prueba
                            AND pv.id_categoria     = :id_categoria
                            AND pv.genero_aplicable = :genero

                     UNION

                     SELECT p.id_prueba, p.nombre_prueba, p.tipo, pv_abs.especificaciones
                     FROM pruebas p
                     INNER JOIN pruebas_variantes pv_abs
                             ON pv_abs.id_prueba        = p.id_prueba
                            AND pv_abs.id_categoria     = :id_absoluta
                            AND pv_abs.genero_aplicable = :genero2
                     WHERE EXISTS (
                         SELECT 1 FROM pruebas_variantes pv_user
                         WHERE pv_user.id_prueba        = p.id_prueba
                           AND pv_user.id_categoria     = :id_categoria2
                           AND pv_user.genero_aplicable = :genero3
                     )

                     UNION

                     SELECT p.id_prueba, p.nombre_prueba, p.tipo, NULL AS especificaciones
                     FROM pruebas p
                     WHERE NOT EXISTS (
                         SELECT 1 FROM pruebas_variantes pv2
                         WHERE pv2.id_prueba = p.id_prueba
                     )

                     ORDER BY tipo ASC, nombre_prueba ASC"
                );
                $stmtP->bindParam(':id_categoria',  $id_categoria, PDO::PARAM_INT);
                $stmtP->bindParam(':genero',         $genero,       PDO::PARAM_STR);
                $stmtP->bindValue(':id_absoluta',    $id_absoluta,  PDO::PARAM_INT);
                $stmtP->bindParam(':genero2',        $genero,       PDO::PARAM_STR);
                $stmtP->bindParam(':id_categoria2',  $id_categoria, PDO::PARAM_INT);
                $stmtP->bindParam(':genero3',        $genero,       PDO::PARAM_STR);
            }

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
