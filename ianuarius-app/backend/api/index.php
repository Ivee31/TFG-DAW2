<?php

require_once '../autoload.php';

// CABECERAS CORS PARA PRODUCCION
$origen_permitido = "https://tu-proyecto.vercel.app";
$origen_peticion = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origen_peticion === $origen_permitido || $origen_peticion === "http://localhost:5173") {
    header("Access-Control-Allow-Origin: $origen_peticion");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
}

// gestion de peticion preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = trim($path, '/');
$segments = explode('/', $path);

$endpoint = $segments[0] ?? '';

switch ($endpoint) {
    case 'login':
        if ($method == 'POST') {
            AuthController::login();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'session':
        if ($method == 'GET') {
            AuthController::sesion();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'logout':
        if ($method == 'POST') {
            AuthController::logout();

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'marcas':
        if ($method == 'POST') {
            MarcaController::guardar();

        } elseif ($method == 'GET') {
            MarcaController::listar();

        } elseif ($method == 'DELETE') {
            $id_marca = (int)($segments[1] ?? 0);
            MarcaController::eliminar($id_marca);

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;
    
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);

        break;
}