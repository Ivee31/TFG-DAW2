<?php

require_once '../autoload.php';

header('Content-Type: application/json; charset=utf-8');

// CABECERAS CORS
// Siempre enviamos CORS para el dominio de produccion.
// No dependemos de que HTTP_ORIGIN llegue intacto (InfinityFree/Cloudflare puede eliminarlo).
$produccion_url  = "https://apache.handmadegames.org/ivan2_daw2";
$localhost_url   = "http://localhost:5173";
$origen_peticion = $_SERVER['HTTP_ORIGIN'] ?? '';

$cors_origin = ($origen_peticion === $localhost_url) ? $localhost_url : $produccion_url;

header("Access-Control-Allow-Origin: $cors_origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Vary: Origin");

// gestion de peticion preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
$path = trim(substr($uri, strlen($base)), '/');
$segments = explode('/', $path ?: '');

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

    case 'register':
        if ($method == 'POST') {
            AuthController::register();
        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'categorias':
        if ($method == 'GET') {
            CategoriaController::disponibles();
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

    case 'usuarios':
        $sub = $segments[1] ?? '';
        if ($sub === 'atletas' && $method === 'GET') {
            UsuarioController::listarAtletas();
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Endpoint not found"]);
        }
        break;

    case 'admin':
        $sub = $segments[1] ?? '';
        if ($sub === 'pendientes' && $method === 'GET') {
            AdminController::pendientes();
        } elseif ($sub === 'activar' && $method === 'POST') {
            $id = (int)($segments[2] ?? 0);
            AdminController::activar($id);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Endpoint not found"]);
        }
        break;

    case 'pruebas':
        if ($method == 'GET') {
            PruebaController::disponibles();
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

        } elseif ($method == 'PUT') {
            $id_marca = (int)($segments[1] ?? 0);
            MarcaController::actualizar($id_marca);

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