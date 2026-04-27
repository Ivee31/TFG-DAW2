# imagen base php con apache
FROM php:8.2-apache

# instalar extensiones pdo para mysql
RUN docker-php-ext-install pdo pdo_mysql

# habilitar mod rewrite apache
RUN a2enmod rewrite