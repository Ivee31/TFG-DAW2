# imagen base php con apache
FROM php:8.2-apache

# instalar extensiones pdo para mysql
RUN docker-php-ext-install pdo pdo_mysql

# habilitar mod rewrite apache
RUN a2enmod rewrite

# permitir .htaccess en el directorio raiz
RUN sed -i 's|<Directory /var/www/>|<Directory /var/www/html/>|g; s|AllowOverride None|AllowOverride All|g' /etc/apache2/apache2.conf
