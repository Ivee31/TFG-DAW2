<?php

spl_autoload_register(function ($class){

    $paths = [
        __DIR__ . '/config/' . $class . '.php',
        __DIR__ . '/api/controllers/' . $class . '.php',
        __DIR__ . '/api/models/' . $class . '.php',
        __DIR__ . '/utils/' . $class . '.php',
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            require_once $path;
            break;

        }

    }

});