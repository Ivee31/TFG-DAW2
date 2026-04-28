<?php

class AuthController {

    public static function login() {
        // configurar cookie de sesion antes de iniciarla
        self::iniciarSesion();

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
                if (password_verify($password, $user['password_hash'])) {
                    
                    // guardar datos clave en sesion
                    $_SESSION['id_usuario'] = $user['id_usuario'];
                    $_SESSION['rol']        = $user['rol'];

                    // quitamos hash de los datos publicos a enviar
                    unset($user['password_hash']);

                    http_response_code(200);
                    echo json_encode([
                        "status" => "success",
                        "user"   => $user
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

    private static function iniciarSesion() {
        session_set_cookie_params([
            'lifetime' => 86400,
            'path'     => '/',
            'domain'   => '',
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);
        session_start();
    }

    // destruye la sesion del servidor
    public static function logout() {
        self::iniciarSesion();
        session_destroy();

        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Sesion cerrada"]);
    }

    // comprueba si hay sesion activa y devuelve datos del usuario
    public static function sesion() {
        self::iniciarSesion();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "No autenticado"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT id_usuario, nombre, apellidos, email, rol FROM usuarios WHERE id_usuario = :id"
            );
            $stmt->bindParam(':id', $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                http_response_code(200);
                echo json_encode(["status" => "success", "user" => $user]);
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "error" => "Usuario no encontrado"]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }
}
