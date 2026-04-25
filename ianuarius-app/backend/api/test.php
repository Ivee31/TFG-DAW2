<?php
// backend/api/test.php 

require_once '../config/db.php';

try {
    $stmt = $pdo->query('SELECT id_usuario, nombre, apellidos, email, rol FROM usuarios');
    $usuarios = $stmt->fetchAll();

    // devolver en format json
	echo json_encode([
		"status" => "success",
		"data" => $usuarios
	]);

}catch (\Throwable $th) {
	echo json_encode([
		"status" => "error",
		"mensaje" => $e->getMessage()
	]);
}