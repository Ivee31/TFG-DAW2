# README - IANUARIUS

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

<br>

<p align="right">
	<a href="https://ivee31.github.io/TFG-DAW2/" target="_blank">🌐 Ver Documentación (Memoria) Online</a><br>
	<span>(pinchar con 'ctrl' para abrir en otra pestaña)</span>
</p>
<p align="right">
	<a href="https://apache.handmadegames.org/ivan2_daw2/" target="_blank">🌐 Aplicación desplegada Online</a><br>
	<span>(pinchar con 'ctrl' para abrir en otra pestaña)</span>
</p>

---

## ¿Qué es Ianuarius?

Ianuarius es una plataforma web de gestión integral para el Club de Atletismo Ianuarius de Salamanca. Digitaliza los procesos de inscripción de atletas, gestión de marcas deportivas, seguimiento de entrenamientos y administración del club, eliminando la burocracia en papel que caracteriza a los clubes modestos.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | PHP 8.2 (API REST sin framework) |
| Base de datos | MySQL 8.0 |
| Entorno local | Docker + Docker Compose |
| Autenticación | Sesiones PHP + Google OAuth 2.0 |
| Email | Brevo (API transaccional) |

---

## Roles

- **Atleta** — consulta sus marcas, registra feedback de entrenamientos, sube documentación y gestiona su inscripción.
- **Entrenador** — visualiza y filtra fichas de todos los atletas, consulta marcas y calendario global.
- **Admin** — gestión completa: atletas, entrenadores, plantilla PDF de inscripción y calendario de eventos.

---

## Funcionalidades principales

- Login / Registro con credenciales propias o Google OAuth
- Recuperación de contraseña por email (Brevo)
- Perfil de usuario: datos personales, foto, DNI escaneado, eliminación de cuenta (RGPD)
- Dashboard del atleta: marcas vinculadas a eventos, sensaciones emoji 1-5
- Inscripción PDF: admin sube plantilla, atleta la rellena en el navegador
- Calendario de eventos (competiciones, controles, escolares…)
- Panel del entrenador: filtros por texto, género y categoría
- Panel de administración: gestión de atletas y entrenadores
- Aviso legal público

---

## Estructura del proyecto

```
TFG-DAW2/
└── ianuarius-app/
    ├── backend/          # API REST PHP 8.2 (Apache)
    │   └── api/
    │       ├── index.php           # Enrutador central
    │       ├── controllers/        # Lógica de negocio por módulo
    │       └── config/             # Conexión BD y variables de entorno
    ├── frontend/         # SPA React 18 + Vite + Tailwind
    │   └── src/
    │       ├── App.jsx             # Enrutador de vistas
    │       └── components/         # Componentes por sección
    ├── database/
    │   └── ianuarius.sql           # Esquema completo + datos de catálogo
    ├── docker-compose.yml
    └── Dockerfile
```

---

## Licencia
Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de la licencia, visite [Creative Commons](http://creativecommons.org/licenses/by-sa/3.0/es/) o envíe una carta a Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.

---

> [!WARNING]
> Para correr la aplicación en local, se debe usar la rama `main-dev`. De lo contrario el desarrollador deberá gestionar las posibles incompatibilidades.

> [!NOTE]
> El `.docx` de la memoria del proyecto se encuentra en la rama `gh-pages`.

<br>

---

## Manual de instalación

### 1.1 Requisitos previos

- **Docker Desktop** (o Docker Engine con Docker Compose v2+)
- **Node.js** v18 o superior + npm
- **Git**

### 1.2 Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd TFG-DAW2/ianuarius-app
```

### 1.3 Configurar variables de entorno del backend

Crear o editar `ianuarius-app/backend/.env`:

```env
DB_HOST=db
DB_NAME=ianuarius_db
DB_USER=root
DB_PASS=root
DB_PORT=3306

# URL del frontend (para enlaces en emails)
APP_URL=http://localhost:5173

# Clave API de Brevo (email transaccional)
# Obtener en: https://app.brevo.com → SMTP & API → API Keys
BREVO_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.4 Levantar contenedores Docker

```bash
docker compose up -d --build
```

Esto levanta tres servicios:

| Servicio | URL local | Descripción |
|----------|-----------|-------------|
| `ianuarius_web` | http://localhost:8081 | Apache + PHP 8.2 |
| `ianuarius_db` | puerto 3307 | MySQL 8.0 |
| `ianuarius_pma` | http://localhost:8082 | phpMyAdmin (root/root) |

> [!WARNING]
> Si cambias la configuración de Docker, relanza `docker compose up -d --build`.

### 1.5 Importar la base de datos

Desde phpMyAdmin (`http://localhost:8082`) o por línea de comandos:

```bash
docker exec -i ianuarius_db mysql -u root -proot ianuarius_db < database/ianuarius.sql
```

### 1.6 Configurar y arrancar el frontend

Crear `ianuarius-app/frontend/.env`:

```env
# Client ID de Google OAuth
# Obtener en: Google Cloud Console → APIs & Services → Credentials
VITE_GOOGLE_CLIENT_ID=XXXXXXXXXXXXXXXX.apps.googleusercontent.com
```

Instalar dependencias y arrancar:

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en **http://localhost:5173**.

Para generar el build de producción:

```bash
npm run build
```

### 1.7 Seguridad y CORS

- Autenticación mediante **Cookies HttpOnly** (sin acceso desde JS).
- El archivo `vite.config.js` actúa como proxy, redirigiendo peticiones `/api` al servidor PHP en puerto 8081.
