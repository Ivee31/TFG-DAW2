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
            
        }else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }

        break;
    
    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);

        break;
}