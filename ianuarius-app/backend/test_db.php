<?php
// SCRIPT TEMPORAL DE DIAGNOSTICO - BORRAR DESPUES
require_once __DIR__ . '/autoload.php';

$host = Config::get('DB_HOST');
$name = Config::get('DB_NAME');
$user = Config::get('DB_USER');
$port = Config::get('DB_PORT');

echo "Host: $host | DB: $name | User: $user | Port: $port<br>";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$name;port=$port;charset=utf8mb4",
        $user,
        Config::get('DB_PASS')
    );
    echo "Conexion OK<br>";

    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tablas: " . implode(', ', $tables) . "<br>";

} catch (PDOException $e) {
    echo "Error PDO: " . $e->getMessage();
}
