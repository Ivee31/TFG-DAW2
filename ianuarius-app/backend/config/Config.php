<?php

// clase configuracion entorno
class Config {
    
    const CHARSET = 'utf8mb4';
    const LOGFILE = __DIR__ . "/ianuarius_errors.log";

    // carga variables del env
    public static function loadEnv() {
        $file = __DIR__ . '/.env';
        
        if (file_exists($file)) {
            $env = parse_ini_file($file);
            foreach ($env as $key => $value) {
                $_ENV[$key] = $value;
            }
        }
    }

    // obtiene variable entorno
    public static function get($key, $default = '') {
        return $_ENV[$key] ?? $default;
    }
}

// inicializamos entorno
Config::loadEnv();