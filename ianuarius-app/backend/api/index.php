<?php

require_once '../autoload.php';

// CABECERAS CORS
// Siempre enviamos CORS para el dominio de produccion.
// No dependemos de que HTTP_ORIGIN llegue intacto (InfinityFree/Cloudflare puede eliminarlo).
$vercel_url      = "https://tfg-daw-2.vercel.app";
$localhost_url   = "http://localhost:5173";
$origen_peticion = $_SERVER['HTTP_ORIGIN'] ?? '';

$cors_origin = ($origen_peticion === $localhost_url) ? $localhost_url : $vercel_url;

header("Access-Control-Allow-Origin: $cors_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Vary: Origin");

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