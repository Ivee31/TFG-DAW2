<?php

class AuthController {

    public static function login() {
        header('Content-Type: application/json');
        
        // obtenemos el contenido del json
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Email y contraseña son requeridos"]);
            return;
        }

        $email = trim($input['email']);
        $password = trim($input['password']);

        try {
            $pdo = Connect::conexion();
            $stmt = $pdo->prepare("SELECT id_usuario, nombre, apellidos, email, password_hash, rol FROM usuarios WHERE email = :email");
            $stmt->bindParam(":email", $email, PDO::PARAM_STR);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                // contraseñas sin cifrar temporalmente
                // si se usa password_hash() (cuando acabe las pruebas), cambiar if a:
                // if (password_verify($password, $user['password_hash'])) {
                if ($password === $user['password_hash']) {
                    
                    // contraseña correcta = quitamos hash de los datos a enviar
                    unset($user['password_hash']);

                    // respuesta con exito
                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "user" => $user
                    ]);
                    return;
                }
            }

            // si usuario no existe o contraseña incorrecta
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "Credenciales incorrectas"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno del servidor"]);
        }
    }
}
