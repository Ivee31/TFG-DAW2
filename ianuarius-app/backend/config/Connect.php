<?php

class Connect {

    public static function conexion() {

        try {
            $connection = new PDO(
                'mysql:host=' . Config::HOST .
                ';dbname=' . Config::DATABASE . 
                ';port=' . Config::PORT . 
                ';charset=' . Config::CHARSET,

                Config::USERNAME,
                Config::PASSWORD
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