<?php

require_once '../autoload.php';

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