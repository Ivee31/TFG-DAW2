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
        $sub = $segments[1] ?? '';
        if ($method === 'GET' && $sub === 'todas') {
            CategoriaController::todas();
        } elseif ($method == 'GET') {
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

        } elseif ($sub === 'atleta' && $method === 'GET') {
            $id = (int)($segments[2] ?? 0);
            UsuarioController::perfilAtleta($id);

        } elseif ($sub === 'entrenadores' && $method === 'GET') {
            UsuarioController::listarEntrenadores();

        } elseif ($sub === 'email' && $method === 'PUT') {
            UsuarioController::cambiarEmail();

        } elseif ($sub === 'foto' && $method === 'PUT') {
            UsuarioController::subirFoto();

        } elseif ($sub === 'perfil' && $method === 'PUT') {
            UsuarioController::actualizarPerfil();

        } elseif ($sub === 'password' && $method === 'PUT') {
            UsuarioController::cambiarPassword();

        } elseif ($sub === 'dni' && $method === 'PUT') {
            UsuarioController::subirDni();

        } elseif ($sub === 'carnet' && $method === 'PUT') {
            UsuarioController::subirCarnet();

        } elseif ($sub === 'inscripcion-pdf' && $method === 'PUT') {
            UsuarioController::subirInscripcionPdf();

        } elseif ($sub === 'cuenta' && $method === 'DELETE') {
            UsuarioController::eliminarCuenta();

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

        } elseif ($sub === 'plantilla-inscripcion' && $method === 'GET') {
            AdminController::obtenerPlantilla();

        } elseif ($sub === 'plantilla-inscripcion' && $method === 'PUT') {
            AdminController::subirPlantilla();

        } elseif ($sub === 'inscripcion' && $method === 'PUT') {
            $id = (int)($segments[2] ?? 0);
            AdminController::marcarPago($id);

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
        $sub = $segments[1] ?? '';
        if ($method == 'POST') {
            MarcaController::guardar();

        } elseif ($method === 'GET' && $sub === 'atleta') {
            $id = (int)($segments[2] ?? 0);
            MarcaController::listarDeAtleta($id);

        } elseif ($method == 'GET') {
            MarcaController::listar();

        } elseif ($method == 'DELETE') {
            $id_marca = (int)($sub ?: 0);
            MarcaController::eliminar($id_marca);

        } elseif ($method == 'PUT') {
            $id_marca = (int)($sub ?: 0);
            MarcaController::actualizar($id_marca);

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;
    
    case 'google-login':
        if ($method === 'POST') {
            AuthController::loginGoogle();

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'google-complete':
        if ($method === 'POST') {
            AuthController::completeGoogleRegister();

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'forgot-password':
        if ($method === 'POST') {
            ResetController::solicitar();

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'reset-password':
        if ($method === 'POST') {
            ResetController::resetear();

        } else {
            http_response_code(405);
            echo json_encode(["error" => "Method not allowed"]);
        }
        break;

    case 'eventos':
        $sub = $segments[1] ?? '';
        if ($method === 'GET' && $sub === 'proximos') {
            EventoController::proximos();

        } elseif ($method === 'GET' && $sub === 'mis-competiciones') {
            EventoController::misCompeticionesPasadas();

        } elseif ($method === 'GET') {
            EventoController::listar();

        } elseif ($method === 'POST') {
            EventoController::crear();

        } elseif ($method === 'DELETE') {
            $id_evento = (int)($sub ?: 0);
            EventoController::eliminar($id_evento);

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