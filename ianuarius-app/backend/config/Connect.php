<?php

class Connect {

    public static function conexion() {

        try {
            $connection = new PDO(
                'mysql:host=' . Config::get('DB_HOST') .
                ';dbname=' . Config::get('DB_NAME') . 
                ';port=' . Config::get('DB_PORT') . 
                ';charset=' . Config::CHARSET,

                Config::get('DB_USER'),
                Config::get('DB_PASS')
            );

            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $connection;

        } catch (PDOException $e) {
            self::manageError($e);

        }
    }

    protected static function manageError (PDOException $e) {
        $information = "Fichero: " . $e->getFile() . PHP_EOL
        . "Línea: " . $e->getLine() . PHP_EOL
        . "Mensaje: " . $e->getMessage() . PHP_EOL
        . "------------------------" . PHP_EOL;

        // Registrar en el log
        error_log($information, 3, Config::LOGFILE);
        
        http_response_code(500);
        exit(json_encode(["error" => "Error interno de base de datos. Consulte los logs."]));
    }

}