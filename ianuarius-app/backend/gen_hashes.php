<?php
// SCRIPT TEMPORAL - BORRAR DESPUES DE USAR
$passwords = [
    'admin@ianuarius.com' => 'admin123',
    'ivan@ianuarius.com'  => 'atleta123',
];

echo "<pre style='font-family:monospace;font-size:14px;padding:20px'>";
echo "-- Copia este SQL y ejecutalo en phpMyAdmin de InfinityFree\n\n";

foreach ($passwords as $email => $plain) {
    $hash = password_hash($plain, PASSWORD_BCRYPT);
    echo "UPDATE usuarios SET password_hash = '$hash' WHERE email = '$email';\n\n";
}

echo "</pre>";
