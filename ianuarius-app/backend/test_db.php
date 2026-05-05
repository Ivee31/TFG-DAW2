<?php
// SCRIPT TEMPORAL DE DIAGNOSTICO - BORRAR DESPUES
require_once __DIR__ . '/autoload.php';

$name = Config::get('DB_NAME');
$user = Config::get('DB_USER');
$pass = Config::get('DB_PASS');

// buscar sockets mysql en el sistema
$sockets = array_merge(
    glob('/tmp/*.sock') ?: [],
    glob('/var/run/mysql*/*.sock') ?: [],
    glob('/run/mysql*/*.sock') ?: [],
    glob('/run/mysqld/*.sock') ?: []
);
echo "Sockets encontrados: " . (empty($sockets) ? 'ninguno' : implode(', ', $sockets)) . "<br>";
echo "PHP default socket: " . ini_get('pdo_mysql.default_socket') . "<br><br>";

$intentos = [
    "host=localhost;port=3306"           => "mysql:host=localhost;port=3306;dbname=$name;charset=utf8mb4",
    "host=127.0.0.1;port=3306"          => "mysql:host=127.0.0.1;port=3306;dbname=$name;charset=utf8mb4",
    "host=mysql.handmadegames.org"       => "mysql:host=mysql.handmadegames.org;port=3306;dbname=$name;charset=utf8mb4",
    "host=db.handmadegames.org"          => "mysql:host=db.handmadegames.org;port=3306;dbname=$name;charset=utf8mb4",
    "host=handmadegames.org;port=3306"   => "mysql:host=handmadegames.org;port=3306;dbname=$name;charset=utf8mb4",
    "host=handmadegames.org;port=3307"   => "mysql:host=handmadegames.org;port=3307;dbname=$name;charset=utf8mb4",
];

foreach ($intentos as $label => $dsn) {
    try {
        $pdo = new PDO($dsn, $user, $pass);
        echo "<b style='color:green'>OK: $label</b><br>";
        break;
    } catch (PDOException $e) {
        echo "FAIL [$label]: " . $e->getMessage() . "<br>";
    }
}
