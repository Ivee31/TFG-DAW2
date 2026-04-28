# MEMORIA DEL PROYECTO - IANUARIUS

<a name="figura1-logo"></a>
<p align="center">
	<img src="img/logoIanuarius.png" alt="Logotipo Ianuarius" width="300">
	<br>
	<em>"Atletismo Ianuarius Salamanca"</em>
</p>
<br><br>

- **Autor:** Iván Martín Nieto
- **Tutor:** Serafina Martín Marcos
- **Ciclo:** Desarrollo de Aplicaciones Web (I.E.S. Venancio Blanco)

<br><br><br><br>

<p align="right">
	<a href="https://ivee31.github.io/TFG-DAW2/" target="_blank">🌐 Ver Documentación (Memoria) Online</a><br>
	<span>(pinchar con 'ctrl' para abrir en otra pestaña)</span>
</p>

---
<br>

## Licencia
Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de la licencia, visite [Creative Commons](http://creativecommons.org/licenses/by-sa/3.0/es/) o envíe una carta a Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.

---
<br><br>

// MANUAL DE DESPLIEGUE E INSTALACION

## 1. Configuracion del Entorno

Este apartado detalla los pasos tecnicos necesarios para poner en marcha la plataforma Ianuarius, separando la configuracion del servidor backend y el frontend.


### 1.1 Requisitos Previos

// software necesario para ejecucion
* **Virtualizador:** Docker desktop instalado.
* **Entorno JS:** Node.js (v18+) y gestor npm.
* **Control Versiones:** Git instalado.



### 1.2 Configuracion de la Base de Datos

// inicializacion de datos en mysql

1. Iniciar servicios de Apache y MySQL.
2. Importar el esquema localizado en `backend/database/ianuarius.sql`.
3. Configurar el archivo `.env` en la raiz del backend con las credenciales:

```env
// CONFIGURACION CONEXION PDO
DB_HOST=localhost
DB_NAME=ianuarius_db
DB_USER=root
DB_PASS=
DB_PORT=3306
```
### 1.3 Montaje de los Contenedores

1. Tener programa docker corriendo.
2. Acceder al directorio raiz del programa `/ianuarius-app`.
3. Componer los containers necesarios:
```bash
# COMPOSE DE LOS CONTENEDORES NECESARIOS
docker compose up -d --build
 ```
**¡¡ADVERTENCIA!! En caso de realizar cambios en la configuración q afecten al funcionamiento del docker, se deberá relanzar el compose up en la ruta pertinente**

### 1.4 Despliegue del Frontend

1. Acceder a la carpeta del cliente: `/ianuarius-app/frontend`.
2. Instalar dependencias necesarias:

```bash
# DESCARGA DE MODULOS NODE
npm install
```

3. Arrancar el servidor de desarrollo:

```bash
# INICIO ENTORNO LOCAL
npm run dev
```

### 1.5 Seguridad y CORS

La aplicacion implementa sesiones seguras mediante **Cookies HttpOnly**. 

* El archivo `vite.config.js` actua como proxy para redirigir peticiones `/api` al servidor PHP.


### 1.5 Acceso al Sistema

* **URL:** `http://localhost:5173` (con `npm run dev` corriendo)
* **phpMyAdmin:** `http://localhost:8082`
