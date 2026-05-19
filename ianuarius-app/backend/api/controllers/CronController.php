<?php

class CronController {

    private const DIAS_POR_FRECUENCIA = [
        'muy_alta' => [7, 5, 3, 1],
        'alta'     => [7, 3],
        'baja'     => [7],
    ];

    public static function recordatorio(): void {
        $keyEnv     = Config::get('CRON_KEY', '');
        $keyRequest = trim($_GET['key'] ?? '');

        if (!$keyEnv || !$keyRequest || !hash_equals($keyEnv, $keyRequest)) {
            http_response_code(403);
            echo json_encode(["status" => "error", "error" => "Unauthorized"]);
            return;
        }

        try {
            $pdo = Connect::conexion();

            // una sola ejecucion por dia — INSERT IGNORE falla silenciosamente si ya existe
            $ins = $pdo->prepare(
                "INSERT IGNORE INTO cron_log (tipo, fecha) VALUES ('recordatorio', CURDATE())"
            );
            $ins->execute();

            if ($ins->rowCount() === 0) {
                http_response_code(200);
                echo json_encode(["status" => "skipped", "msg" => "Ya ejecutado hoy"]);
                return;
            }

            $todosDias = [7, 5, 3, 1];
            $enviados  = 0;

            foreach ($todosDias as $dias) {
                $frecuenciasActivas = array_keys(array_filter(
                    self::DIAS_POR_FRECUENCIA,
                    fn($d) => in_array($dias, $d)
                ));

                $stmtEvt = $pdo->prepare(
                    "SELECT id_evento, titulo, fecha_hora, tipo_pista, id_categoria
                     FROM eventos_calendario
                     WHERE DATE(fecha_hora) = DATE(NOW() + INTERVAL :dias DAY)"
                );
                $stmtEvt->bindValue(':dias', $dias, PDO::PARAM_INT);
                $stmtEvt->execute();
                $eventos = $stmtEvt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($eventos)) continue;

                $placeholders = implode(',', array_fill(0, count($frecuenciasActivas), '?'));

                foreach ($eventos as $evento) {
                    if ($evento['id_categoria']) {
                        // JOIN trae la fila de la categoria del evento; TIMESTAMPDIFF calcula edad real del atleta
                        $stmtAtl = $pdo->prepare(
                            "SELECT u.id_usuario, u.nombre, u.email FROM usuarios u
                             JOIN categorias c ON c.id_categoria = ?
                             WHERE u.rol = 'Atleta' AND u.estado_cuenta = 1 AND u.notificaciones_email = 1
                               AND u.frecuencia_notif IN ({$placeholders})
                               AND TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) BETWEEN c.edad_min AND c.edad_max
                               AND (c.genero IS NULL OR c.genero = u.genero)"
                        );
                        $stmtAtl->execute(array_merge([$evento['id_categoria']], $frecuenciasActivas));
                    } else {
                        // Evento abierto/absoluto: excluir menores de Sub-16 (edad < 14)
                        $stmtAtl = $pdo->prepare(
                            "SELECT u.id_usuario, u.nombre, u.email FROM usuarios u
                             WHERE u.rol = 'Atleta' AND u.estado_cuenta = 1 AND u.notificaciones_email = 1
                               AND u.frecuencia_notif IN ({$placeholders})
                               AND TIMESTAMPDIFF(YEAR, u.fecha_nacimiento, CURDATE()) >= 14"
                        );
                        $stmtAtl->execute($frecuenciasActivas);
                    }

                    foreach ($stmtAtl->fetchAll(PDO::FETCH_ASSOC) as $atleta) {
                        self::enviarEmail($atleta, $evento, $dias);
                        $enviados++;
                    }
                }
            }

            http_response_code(200);
            echo json_encode(["status" => "success", "emails_enviados" => $enviados]);

        } catch (PDOException $e) {
            error_log("[CronController] DB error: " . $e->getMessage(), 3, Config::LOGFILE);
            http_response_code(500);
            echo json_encode(["status" => "error", "error" => "Error interno"]);
        }
    }

    private static function enviarEmail(array $atleta, array $evento, int $dias): void {
        $nombre    = htmlspecialchars($atleta['nombre']);
        $titulo    = htmlspecialchars($evento['titulo']);
        $fechaObj  = new DateTime($evento['fecha_hora']);
        $fechaStr  = $fechaObj->format('d/m/Y \a \l\a\s H:i');
        $diasLabel = $dias === 1 ? '1 día' : "{$dias} días";
        $modalidad = ($evento['tipo_pista'] === 'pista cubierta') ? 'Pista cubierta (Indoor)' : 'Pista al aire libre (Outdoor)';

        $subject = "Recordatorio: {$titulo} — faltan {$diasLabel} | Ianuarius";
        $html = "
            <div style='font-family:sans-serif;max-width:480px;margin:0 auto;background:#171717;padding:32px;border-radius:8px;'>
                <h2 style='color:#FE0000;letter-spacing:4px;font-size:13px;text-transform:uppercase;margin:0 0 24px;'>Ianuarius Athletics</h2>
                <p style='color:#e5e7eb;margin:0 0 12px;'>Hola, <strong>{$nombre}</strong>.</p>
                <p style='color:#9ca3af;font-size:14px;margin:0 0 16px;line-height:1.6;'>
                    Tienes una competición en <strong style='color:#FE0000;'>{$diasLabel}</strong>:
                </p>
                <div style='background:#222;border-left:3px solid #FE0000;border-radius:4px;padding:16px 20px;margin:0 0 24px;'>
                    <p style='color:#fff;font-size:15px;font-weight:bold;margin:0 0 8px;'>{$titulo}</p>
                    <p style='color:#9ca3af;font-size:13px;margin:0 0 4px;'>📅 {$fechaStr}</p>
                    <p style='color:#9ca3af;font-size:13px;margin:0;'>🏟️ {$modalidad}</p>
                </div>
                <p style='color:#4b5563;font-size:11px;margin-top:24px;line-height:1.6;'>
                    Para cambiar la frecuencia de estos avisos, ve a
                    <strong style='color:#9ca3af;'>Mi Perfil → Notificaciones</strong>.
                </p>
            </div>
        ";

        $api_key = Config::get('BREVO_KEY');
        $payload = json_encode([
            'sender'      => ['name' => 'Ianuarius', 'email' => 'ivinmn31@gmail.com'],
            'to'          => [['email' => $atleta['email'], 'name' => $atleta['nombre']]],
            'subject'     => $subject,
            'htmlContent' => $html,
        ]);

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['api-key: ' . $api_key, 'Content-Type: application/json'],
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
        ]);
        $response = curl_exec($ch);
        $code     = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($code !== 201) {
            error_log("[CronController] Brevo error {$atleta['email']}: {$response}", 3, Config::LOGFILE);
        }
    }
}
