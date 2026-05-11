<?php

class EventoController {

    const TIPOS_EVENTO = ['nacional', 'autonomico', 'provincial', 'control', 'escolares'];
    const TIPOS_PISTA  = ['aire libre', 'pista cubierta', 'cross'];

    // GET /eventos?mes=YYYY-MM
    public static function listar(): void {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'error' => 'No autenticado']);
            return;
        }

        $rol        = $_SESSION['rol'];
        $id_usuario = $_SESSION['id_usuario'];
        $mes        = $_GET['mes'] ?? date('Y-m');

        if (!preg_match('/^\d{4}-\d{2}$/', $mes)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Formato de mes inválido']);
            return;
        }

        [$year, $month] = explode('-', $mes);

        try {
            $pdo = Connect::conexion();

            if ($rol === 'Atleta') {
                $stmt = $pdo->prepare(
                    "SELECT u.id_categoria FROM usuarios u WHERE u.id_usuario = ?"
                );
                $stmt->execute([$id_usuario]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $id_categoria = $row['id_categoria'] ?? null;

                // eventos de su categoria o eventos para todos (id_categoria NULL)
                $stmt = $pdo->prepare(
                    "SELECT e.*, u.nombre AS creado_por, c.nombre AS categoria_nombre
                     FROM eventos_calendario e
                     JOIN usuarios u ON e.id_usuario = u.id_usuario
                     LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
                     WHERE YEAR(e.fecha_hora) = ? AND MONTH(e.fecha_hora) = ?
                       AND (e.id_categoria IS NULL OR e.id_categoria = ?)
                     ORDER BY e.fecha_hora"
                );
                $stmt->execute([$year, $month, $id_categoria]);
            } else {
                // Entrenador / Admin: todos los eventos
                $stmt = $pdo->prepare(
                    "SELECT e.*, u.nombre AS creado_por, c.nombre AS categoria_nombre
                     FROM eventos_calendario e
                     JOIN usuarios u ON e.id_usuario = u.id_usuario
                     LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
                     WHERE YEAR(e.fecha_hora) = ? AND MONTH(e.fecha_hora) = ?
                     ORDER BY e.fecha_hora"
                );
                $stmt->execute([$year, $month]);
            }

            $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'eventos' => $eventos]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'error' => 'Error interno']);
        }
    }

    // POST /eventos
    public static function crear(): void {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'error' => 'No autenticado']);
            return;
        }

        if (!in_array($_SESSION['rol'], ['Entrenador', 'Admin'])) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'error' => 'Sin permiso']);
            return;
        }

        $data       = json_decode(file_get_contents('php://input'), true) ?? [];
        $id_usuario = $_SESSION['id_usuario'];
        $titulo     = trim($data['titulo'] ?? '');
        $descripcion = trim($data['descripcion'] ?? '');
        $fecha_hora  = $data['fecha_hora'] ?? '';
        $fecha_fin   = (isset($data['fecha_fin']) && $data['fecha_fin'] !== '') ? $data['fecha_fin'] : null;
        $enlace      = (isset($data['enlace']) && trim($data['enlace']) !== '') ? trim($data['enlace']) : null;
        $tipo_evento = $data['tipo_evento'] ?? 'control';
        $tipo_pista  = $data['tipo_pista'] ?? 'aire libre';
        $id_categoria = (isset($data['id_categoria']) && $data['id_categoria'] !== '') ? (int)$data['id_categoria'] : null;

        if (!$titulo || !$fecha_hora) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Título y fecha requeridos']);
            return;
        }

        if (!in_array($tipo_evento, self::TIPOS_EVENTO)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Tipo de evento no válido']);
            return;
        }

        if (!in_array($tipo_pista, self::TIPOS_PISTA)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Tipo de pista no válido']);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare(
                "INSERT INTO eventos_calendario (id_usuario, id_categoria, titulo, descripcion, fecha_hora, fecha_fin, enlace, tipo_evento, tipo_pista)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([$id_usuario, $id_categoria, $titulo, $descripcion, $fecha_hora, $fecha_fin, $enlace, $tipo_evento, $tipo_pista]);

            echo json_encode(['status' => 'success', 'id_evento' => $pdo->lastInsertId()]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'error' => 'Error interno']);
        }
    }

    // GET /eventos/proximos?n=2
    public static function proximos(): void {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'error' => 'No autenticado']);
            return;
        }

        $rol        = $_SESSION['rol'];
        $id_usuario = $_SESSION['id_usuario'];
        $n          = min((int)($_GET['n'] ?? 2), 10);

        try {
            $pdo = Connect::conexion();

            if ($rol === 'Atleta') {
                $stmt = $pdo->prepare("SELECT id_categoria FROM usuarios WHERE id_usuario = ?");
                $stmt->execute([$id_usuario]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                $id_categoria = $row['id_categoria'] ?? null;

                $stmt = $pdo->prepare(
                    "SELECT e.*, u.nombre AS creado_por, c.nombre AS categoria_nombre
                     FROM eventos_calendario e
                     JOIN usuarios u ON e.id_usuario = u.id_usuario
                     LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
                     WHERE e.fecha_hora >= NOW()
                       AND (e.id_categoria IS NULL OR e.id_categoria = ?)
                     ORDER BY e.fecha_hora ASC
                     LIMIT ?"
                );
                $stmt->bindValue(1, $id_categoria, PDO::PARAM_INT);
                $stmt->bindValue(2, $n, PDO::PARAM_INT);
                $stmt->execute();
            } else {
                $stmt = $pdo->prepare(
                    "SELECT e.*, u.nombre AS creado_por, c.nombre AS categoria_nombre
                     FROM eventos_calendario e
                     JOIN usuarios u ON e.id_usuario = u.id_usuario
                     LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
                     WHERE e.fecha_hora >= NOW()
                     ORDER BY e.fecha_hora ASC
                     LIMIT ?"
                );
                $stmt->bindValue(1, $n, PDO::PARAM_INT);
                $stmt->execute();
            }

            $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'eventos' => $eventos]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'error' => 'Error interno']);
        }
    }

    // GET /eventos/mis-competiciones — competiciones pasadas visibles al usuario autenticado
    public static function misCompeticionesPasadas(): void {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'error' => 'No autenticado']);
            return;
        }

        try {
            $pdo        = Connect::conexion();
            $id_usuario = (int)$_SESSION['id_usuario'];

            $stmtCat = $pdo->prepare("SELECT id_categoria FROM usuarios WHERE id_usuario = ?");
            $stmtCat->execute([$id_usuario]);
            $row          = $stmtCat->fetch(PDO::FETCH_ASSOC);
            $id_categoria = $row['id_categoria'] ?? null;

            $stmt = $pdo->prepare(
                "SELECT id_evento, titulo, fecha_hora, tipo_evento, tipo_pista
                 FROM eventos_calendario
                 WHERE fecha_hora <= NOW()
                   AND (id_categoria IS NULL OR id_categoria = ?)
                 ORDER BY fecha_hora DESC
                 LIMIT 200"
            );
            $stmt->execute([$id_categoria]);
            $eventos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(['status' => 'success', 'eventos' => $eventos]);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'error' => 'Error interno']);
        }
    }

    // DELETE /eventos/{id}
    public static function eliminar(int $id): void {
        session_start();

        if (!isset($_SESSION['id_usuario'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'error' => 'No autenticado']);
            return;
        }

        if (!in_array($_SESSION['rol'], ['Entrenador', 'Admin'])) {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'error' => 'Sin permiso']);
            return;
        }

        try {
            $pdo  = Connect::conexion();
            $stmt = $pdo->prepare("DELETE FROM eventos_calendario WHERE id_evento = ?");
            $stmt->execute([$id]);

            echo json_encode(['status' => 'success']);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['status' => 'error', 'error' => 'Error interno']);
        }
    }
}
