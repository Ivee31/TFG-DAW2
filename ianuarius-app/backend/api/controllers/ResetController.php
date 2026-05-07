<?php

class ResetController {

    public static function solicitar() {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = trim($input['email'] ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Email no valido"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("SELECT id_usuario, nombre FROM usuarios WHERE email = :email");
            $stmt->bindParam(':email', $email, PDO::PARAM_STR);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // respuesta identica exista o no — evita enumeracion de emails
            if (!$user) {
                http_response_code(200);
                echo json_encode(["status" => "success"]);
                return;
            }

            // invalidar tokens anteriores del mismo email
            $del = $pdo->prepare("DELETE FROM password_resets WHERE email = :email");
            $del->bindParam(':email', $email, PDO::PARAM_STR);
            $del->execute();

            $token   = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', time() + 3600);

            $ins = $pdo->prepare(
                "INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires)"
            );
            $ins->bindParam(':email',   $email,   PDO::PARAM_STR);
            $ins->bindParam(':token',   $token,   PDO::PARAM_STR);
            $ins->bindParam(':expires', $expires, PDO::PARAM_STR);
            $ins->execute();

            self::enviarEmailReset($email, $user['nombre'], $token);

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    public static function resetear() {
        $input    = json_decode(file_get_contents('php://input'), true);
        $token    = trim($input['token']    ?? '');
        $password = trim($input['password'] ?? '');

        if (!$token || !$password || strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(["status" => "error", "error" => "Datos incompletos o contraseña muy corta"]);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "SELECT email FROM password_resets
                 WHERE token = :token AND usado = 0 AND expires_at > NOW()"
            );
            $stmt->bindParam(':token', $token, PDO::PARAM_STR);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row) {
                http_response_code(400);
                echo json_encode(["status" => "error", "error" => "Enlace invalido o expirado"]);
                return;
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $upd = $pdo->prepare("UPDATE usuarios SET password_hash = :hash WHERE email = :email");
            $upd->bindParam(':hash',  $hash,        PDO::PARAM_STR);
            $upd->bindParam(':email', $row['email'], PDO::PARAM_STR);
            $upd->execute();

            $mark = $pdo->prepare("UPDATE password_resets SET usado = 1 WHERE token = :token");
            $mark->bindParam(':token', $token, PDO::PARAM_STR);
            $mark->execute();

            http_response_code(200);
            echo json_encode(["status" => "success"]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    private static function enviarEmailReset($email, $nombre, $token) {
        $app_url = Config::get('APP_URL', 'http://localhost:5173');
        $link    = "{$app_url}?reset_token={$token}";
        $api_key = Config::get('RESEND_KEY');

        $payload = json_encode([
            'from'    => 'Ianuarius <onboarding@resend.dev>',
            'to'      => [$email],
            'subject' => 'Restablecer contraseña — Ianuarius',
            'html'    => "
                <div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#171717;padding:32px;border-radius:8px;'>
                    <h2 style='color:#FE0000;letter-spacing:4px;font-size:13px;text-transform:uppercase;margin:0 0 24px;'>Ianuarius Athletics</h2>
                    <p style='color:#e5e7eb;margin:0 0 12px;'>Hola, <strong>{$nombre}</strong>.</p>
                    <p style='color:#9ca3af;font-size:14px;margin:0 0 24px;line-height:1.6;'>Recibimos una solicitud para restablecer tu contraseña. El enlace es válido durante <strong style='color:#fff;'>1 hora</strong>.</p>
                    <a href='{$link}' style='display:inline-block;background:#FE0000;color:white;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:12px;letter-spacing:3px;text-transform:uppercase;'>
                        Restablecer contraseña
                    </a>
                    <p style='color:#4b5563;font-size:11px;margin-top:32px;'>Si no solicitaste este cambio, ignora este email.</p>
                </div>
            "
        ]);

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $api_key,
                'Content-Type: application/json',
            ],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        curl_exec($ch);
    }
}
