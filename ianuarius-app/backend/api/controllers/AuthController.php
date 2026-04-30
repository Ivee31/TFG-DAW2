<?php

class AuthController {

    public static function login() {
        // configurar cookie de sesion antes de iniciarla
        session_set_cookie_params([
            'lifetime' => 86400,
            'path'     => '/',
            'domain'   => '',
            'secure'   => false,
            'httponly' => true,
            'samesite' => 'Lax'
            
        ]);
        session_start();
        
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
            $stmt = $pdo->prepare("SELECT id_usuario, nombre, apellidos, email, password_hash, rol, estado_cuenta FROM usuarios WHERE email = :email");
            $stmt->bindParam(":email", $email, PDO::PARAM_STR);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if (password_verify($password, $user['password_hash'])) {

                    if (!$user['estado_cuenta']) {
                        http_response_code(403);
                        echo json_encode(["status" => "error", "error" => "Cuenta pendiente de activación. Contacta con un administrador."]);
                        return;
                    }

                    // guardar datos clave en sesion
                    $_SESSION['id_usuario'] = $user['id_usuario'];
                    $_SESSION['rol']        = $user['rol'];

                    unset($user['password_hash']);
                    unset($user['estado_cuenta']);

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

    public static function register() {
        $input = json_decode(file_get_contents('php://input'), true);

        $required = ['nombre', 'apellidos', 'dni', 'email', 'password', 'fecha_nacimiento', 'genero'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "error" => "Todos los campos son obligatorios"]);
                return;
            }
        }

        $nombre           = trim($input['nombre']);
        $apellidos        = trim($input['apellidos']);
        $email            = trim($input['email']);
        $password         = $input['password'];
        $fecha_nacimiento = trim($input['fecha_nacimiento']);
        $genero           = trim($input['genero']);
        $dni              = trim($input['dni']);
        $rol              = in_array($input['rol'] ?? '', ['Atleta', 'Entrenador']) ? $input['rol'] : 'Atleta';
        // Atleta activo de inmediato; Entrenador requiere activación por admin
        $estado_cuenta    = ($rol === 'Atleta') ? 1 : 0;

        if (!in_array($genero, ['M', 'F'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Género no válido"]);
            return;
        }

        try {
            $pdo = Connect::conexion();

            $check = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
            $check->bindParam(':email', $email, PDO::PARAM_STR);
            $check->execute();
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "error" => "El email ya está registrado"]);
                return;
            }

            if ($dni) {
                $checkDni = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE dni = :dni");
                $checkDni->bindParam(':dni', $dni, PDO::PARAM_STR);
                $checkDni->execute();
                if ($checkDni->fetch()) {
                    http_response_code(409);
                    echo json_encode(["status" => "error", "error" => "El DNI ya está registrado"]);
                    return;
                }
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare(
                "INSERT INTO usuarios (nombre, apellidos, dni, email, password_hash, fecha_nacimiento, genero, rol, estado_cuenta)
                 VALUES (:nombre, :apellidos, :dni, :email, :hash, :fecha_nacimiento, :genero, :rol, :estado_cuenta)"
            );
            $stmt->bindParam(':nombre',           $nombre,           PDO::PARAM_STR);
            $stmt->bindParam(':apellidos',         $apellidos,        PDO::PARAM_STR);
            $stmt->bindParam(':dni',               $dni,              PDO::PARAM_STR);
            $stmt->bindParam(':email',             $email,            PDO::PARAM_STR);
            $stmt->bindParam(':hash',              $hash,             PDO::PARAM_STR);
            $stmt->bindParam(':fecha_nacimiento',  $fecha_nacimiento,  PDO::PARAM_STR);
            $stmt->bindParam(':genero',            $genero,           PDO::PARAM_STR);
            $stmt->bindParam(':rol',               $rol,              PDO::PARAM_STR);
            $stmt->bindParam(':estado_cuenta',     $estado_cuenta,    PDO::PARAM_INT);
            $stmt->execute();

            $id = $pdo->lastInsertId();

            // Entrenador: cuenta inactiva hasta activación por admin
            if ($rol === 'Entrenador') {
                http_response_code(201);
                echo json_encode([
                    "status"  => "pending",
                    "message" => "Registro completado. Tu cuenta de Entrenador está pendiente de activación por un administrador."
                ]);
                return;
            }

            session_set_cookie_params([
                'lifetime' => 86400,
                'path'     => '/',
                'domain'   => '',
                'secure'   => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
            $_SESSION['id_usuario'] = $id;
            $_SESSION['rol']        = 'Atleta';

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "user"   => [
                    "id_usuario" => $id,
                    "nombre"     => $nombre,
                    "apellidos"  => $apellidos,
                    "email"      => $email,
                    "rol"        => 'Atleta'
                ]
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno del servidor"]);
        }
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
