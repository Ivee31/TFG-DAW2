<?php
// SCRIPT TEMPORAL DE DIAGNOSTICO - BORRAR DESPUES
require_once __DIR__ . '/autoload.php';

try {
    $pdo = Connect::conexion();
    echo "Conexion OK<br>";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tablas encontradas: " . implode(', ', $tables) . "<br>";

    $count = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
    echo "Usuarios en BD: $count<br>";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
