<?php
// parametros de sesion antes de iniciar
session_set_cookie_params([
    'lifetime' => 86400,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);

// arrancar sesion
session_start();

// carga clase de conexion 
require_once 'Connect.php';

// leer datos JSON que envia React
$data = json_decode(file_get_contents("php://input"));

// comprueba que llegan campos necesarios
if (isset($data->email) && isset($data->password)) {
    $email = $data->email;
    $password = $data->password;

    // llama a metodo para conectar
    $conn = Connect::conexion();

    // preparamos consulta
    $query = "SELECT id_usuario, nombre, apellidos, email, rol, password FROM usuarios WHERE email = :email LIMIT 1";
    $stmt = $conn->prepare($query);
    
    // asigna variable y ejecuta
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    // comprueba si existe usuario
    if ($stmt->rowCount() > 0) {
        // extrae fila de la bd
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // verifica si contraseña coincide con el hash
        if (password_verify($password, $user['password'])) {
            // guarda datos clave en cookie de sesion
            $_SESSION['id_usuario'] = $user['id_usuario'];
            $_SESSION['rol'] = $user['rol'];

            // devuelve solo datos publicos necesarios para interfaz de React
            echo json_encode([
                "status" => "success",
                "user" => [
                    "nombre" => $user['nombre'],
                    "rol" => $user['rol']
                ]
            ]);

        } else {
            // ERROR: Contraseña incorrecta
            echo json_encode(["status" => "error", "error" => "Credenciales invalidas"]);
        }

    }else {
        // ERROR: Mail no encontrado
        echo json_encode(["status" => "error", "error" => "Usuario no encontrado"]);
    }

} else {
    // ERROR: Faltan datos en POST
    echo json_encode(["status" => "error", "error" => "Datos incompletos"]);
}

?>