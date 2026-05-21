<?php

class AuthController {

    private static function iniciarSesion() {
        if (session_status() === PHP_SESSION_NONE) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path'     => '/',
                'domain'   => '',
                'secure'   => false,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }

    public static function login() {
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
            $stmt = $pdo->prepare("SELECT id_usuario, nombre, apellidos, dni, email, genero, fecha_nacimiento, foto_perfil, foto_dni, foto_carnet, inscripcion_pdf, notificaciones_email, frecuencia_notif, password_hash, rol, estado_cuenta FROM usuarios WHERE email = :email");
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

        if (mb_strlen($nombre) < 2 || mb_strlen($nombre) > 100) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Nombre no válido (mín. 2 caracteres)"]);
            return;
        }

        if (mb_strlen($apellidos) < 2 || mb_strlen($apellidos) > 150) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Apellidos no válidos (mín. 2 caracteres)"]);
            return;
        }

        if (!preg_match('/^\d{8}[A-Za-z]$/', $dni)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Formato de DNI no válido (ej. 12345678A)"]);
            return;
        }

        if (strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "La contraseña debe tener al menos 8 caracteres"]);
            return;
        }

        if (!preg_match('/[A-Z]/', $password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "La contraseña debe contener al menos una letra mayúscula"]);
            return;
        }

        if (!preg_match('/[!@#$%^&*()\-_+={}|;:,.?]/', $password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "La contraseña debe contener al menos un carácter especial (ej. !, @, #, -, _)"]);
            return;
        }

        $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha_nacimiento);
        if (!$fechaObj) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Fecha de nacimiento no válida"]);
            return;
        }
        $anioNac    = (int)$fechaObj->format('Y');
        $anioActual = (int)date('Y');
        if ($anioNac < 1930 || $anioNac > $anioActual - 5) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Fecha de nacimiento no válida"]);
            return;
        }

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

            self::iniciarSesion();
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

    // login via Google OAuth — verifica access_token con userinfo endpoint
    public static function loginGoogle() {
        self::iniciarSesion();

        $input        = json_decode(file_get_contents('php://input'), true);
        $access_token = trim($input['access_token'] ?? '');

        if (!$access_token) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Token requerido"]);
            return;
        }

        $gd = self::obtenerDatosGoogle($access_token);
        if (!$gd) {
            http_response_code(401);
            echo json_encode(["status" => "error", "error" => "Token de Google no valido"]);
            return;
        }

        $google_id = $gd['sub'];
        $email     = $gd['email'];
        $nombre    = $gd['given_name']  ?? '';
        $apellidos = $gd['family_name'] ?? '';

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT id_usuario, nombre, apellidos, dni, email, genero, fecha_nacimiento, foto_perfil, foto_dni, foto_carnet, inscripcion_pdf, notificaciones_email, frecuencia_notif, rol, estado_cuenta, google_id
                 FROM usuarios WHERE email = :email OR google_id = :gid"
            );
            $stmt->bindParam(':email', $email,     PDO::PARAM_STR);
            $stmt->bindParam(':gid',   $google_id, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                if (!$user['estado_cuenta']) {
                    http_response_code(403);
                    echo json_encode(["status" => "error", "error" => "Cuenta pendiente de activacion"]);
                    return;
                }

                // vincular google_id si es la primera vez que usa Google
                if (!$user['google_id']) {
                    $upd = $pdo->prepare("UPDATE usuarios SET google_id = :gid WHERE id_usuario = :id");
                    $upd->bindParam(':gid', $google_id,          PDO::PARAM_STR);
                    $upd->bindParam(':id',  $user['id_usuario'],  PDO::PARAM_INT);
                    $upd->execute();
                }

                $_SESSION['id_usuario'] = $user['id_usuario'];
                $_SESSION['rol']        = $user['rol'];

                $user['es_google'] = true;
                unset($user['estado_cuenta'], $user['google_id']);

                http_response_code(200);
                echo json_encode(["status" => "success", "user" => $user]);

            } else {
                // usuario nuevo — guardar datos Google en sesion para completar registro
                $_SESSION['google_pending'] = [
                    'google_id' => $google_id,
                    'email'     => $email,
                    'nombre'    => $nombre,
                    'apellidos' => $apellidos,
                ];

                http_response_code(200);
                echo json_encode([
                    "status"      => "needs_completion",
                    "google_data" => compact('email', 'nombre', 'apellidos'),
                ]);
            }

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    // completa el registro de un usuario que viene de Google (falta DNI, fecha, genero)
    public static function completeGoogleRegister() {
        self::iniciarSesion();

        if (!isset($_SESSION['google_pending'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Sesion de registro Google no encontrada"]);
            return;
        }

        $gd    = $_SESSION['google_pending'];
        $input = json_decode(file_get_contents('php://input'), true);

        foreach (['dni', 'fecha_nacimiento', 'genero'] as $f) {
            if (empty($input[$f])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "error" => "Todos los campos son obligatorios"]);
                return;
            }
        }

        $dni              = trim($input['dni']);
        $fecha_nacimiento = trim($input['fecha_nacimiento']);
        $genero           = trim($input['genero']);
        $rol              = in_array($input['rol'] ?? '', ['Atleta', 'Entrenador']) ? $input['rol'] : 'Atleta';
        $estado_cuenta    = ($rol === 'Atleta') ? 1 : 0;

        if (!in_array($genero, ['M', 'F'])) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Genero no valido"]);
            return;
        }

        try {
            $pdo = Connect::conexion();

            $chkEmail = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE email = :email");
            $chkEmail->bindParam(':email', $gd['email'], PDO::PARAM_STR);
            $chkEmail->execute();
            if ($chkEmail->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "error" => "El email ya esta registrado"]);
                return;
            }

            $chkDni = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE dni = :dni");
            $chkDni->bindParam(':dni', $dni, PDO::PARAM_STR);
            $chkDni->execute();
            if ($chkDni->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "error" => "El DNI ya esta registrado"]);
                return;
            }

            $stmt = $pdo->prepare(
                "INSERT INTO usuarios (nombre, apellidos, dni, email, password_hash, fecha_nacimiento, genero, rol, estado_cuenta, google_id)
                 VALUES (:nombre, :apellidos, :dni, :email, NULL, :fecha, :genero, :rol, :estado, :gid)"
            );
            $stmt->bindParam(':nombre',    $gd['nombre'],    PDO::PARAM_STR);
            $stmt->bindParam(':apellidos', $gd['apellidos'], PDO::PARAM_STR);
            $stmt->bindParam(':dni',       $dni,             PDO::PARAM_STR);
            $stmt->bindParam(':email',     $gd['email'],     PDO::PARAM_STR);
            $stmt->bindParam(':fecha',     $fecha_nacimiento, PDO::PARAM_STR);
            $stmt->bindParam(':genero',    $genero,          PDO::PARAM_STR);
            $stmt->bindParam(':rol',       $rol,             PDO::PARAM_STR);
            $stmt->bindParam(':estado',    $estado_cuenta,   PDO::PARAM_INT);
            $stmt->bindParam(':gid',       $gd['google_id'], PDO::PARAM_STR);
            $stmt->execute();

            $id = $pdo->lastInsertId();
            unset($_SESSION['google_pending']);

            if ($rol === 'Entrenador') {
                http_response_code(201);
                echo json_encode([
                    "status"  => "pending",
                    "message" => "Registro completado. Tu cuenta de Entrenador esta pendiente de activacion."
                ]);
                return;
            }

            $_SESSION['id_usuario'] = $id;
            $_SESSION['rol']        = 'Atleta';

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "user"   => [
                    "id_usuario" => $id,
                    "nombre"     => $gd['nombre'],
                    "apellidos"  => $gd['apellidos'],
                    "email"      => $gd['email'],
                    "rol"        => 'Atleta',
                ],
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    // verifica access_token con Google y devuelve los datos del usuario
    private static function obtenerDatosGoogle($access_token) {
        $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $access_token],
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200 || !$response) return null;

        $data = json_decode($response, true);
        if (empty($data['email']) || empty($data['email_verified'])) return null;

        return $data;
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
                "SELECT id_usuario, nombre, apellidos, dni, email, genero, fecha_nacimiento, foto_perfil, foto_dni, foto_carnet, inscripcion_pdf, notificaciones_email, frecuencia_notif, rol, (google_id IS NOT NULL) AS es_google FROM usuarios WHERE id_usuario = :id"
            );
            $stmt->bindParam(':id', $_SESSION['id_usuario'], PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $user['es_google'] = (bool)$user['es_google'];
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
