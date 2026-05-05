<?php
// SCRIPT TEMPORAL DE DIAGNOSTICO - BORRAR DESPUES
require_once __DIR__ . '/autoload.php';

$name = Config::get('DB_NAME');
$user = Config::get('DB_USER');
$pass = Config::get('DB_PASS');

$intentos = [
    "host=localhost;port=3306"                          => "mysql:host=localhost;port=3306;dbname=$name;charset=utf8mb4",
    "host=127.0.0.1;port=3306"                         => "mysql:host=127.0.0.1;port=3306;dbname=$name;charset=utf8mb4",
    "host=handmadegames.org;port=3306"                  => "mysql:host=handmadegames.org;port=3306;dbname=$name;charset=utf8mb4",
    "socket=/tmp/mysql.sock"                            => "mysql:unix_socket=/tmp/mysql.sock;dbname=$name;charset=utf8mb4",
    "socket=/var/run/mysqld/mysqld.sock"                => "mysql:unix_socket=/var/run/mysqld/mysqld.sock;dbname=$name;charset=utf8mb4",
    "socket=/var/lib/mysql/mysql.sock"                  => "mysql:unix_socket=/var/lib/mysql/mysql.sock;dbname=$name;charset=utf8mb4",
];

foreach ($intentos as $label => $dsn) {
    try {
        $pdo = new PDO($dsn, $user, $pass);
        echo "<b>OK: $label</b><br>";
        break;
    } catch (PDOException $e) {
        echo "FAIL [$label]: " . $e->getMessage() . "<br>";
    }
}
