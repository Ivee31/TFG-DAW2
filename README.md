# MEMORIA DEL PROYECTO - IANUARIUS

<a name="figura1"></a>
<p align="center">
  <img src="img/logoIanuarius.png" alt="Logotipo Ianuarius" width="300">
  <br>
  <em>Figura 1. Logotipo "Atletismo Salamanca Ianuarius"</em>
</p>
<br><br>

- **Autor:** Iván Martín Nieto
- **Tutor:** Serafina Martín Marcos
- **Ciclo:** Desarrollo de Aplicaciones Web (I.E.S. Venancio Blanco)

---

## Licencia
Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de la licencia, visite [Creative Commons](http://creativecommons.org/licenses/by-sa/3.0/es/) o envíe una carta a Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.

---

## Índice de Contenido

- [Índice de Figuras](#índice-de-figuras)
- [Índice de Tablas](#índice-de-tablas)

1. [Estudio del problema y análisis del sistema](#1-estudio-del-problema-y-análisis-del-sistema)
	- 1.1. [Introducción](#11-introducción)
	- 1.2. [Objetivos y alcance](#12-objetivos-y-alcance)
	- 1.3. [Requisitos del sistema (SRS)](#13-requisitos-del-sistema-srs)
2. [Recursos necesarios](#2-recursos-necesarios)
	- 2.1. [Recursos humanos, hardware y software](#21-recursos-humanos-hardware-y-software)
	- 2.2. [Estimación de costes y presupuesto](#22-estimación-de-costes-y-presupuesto)
3. [Planificación y metodología](#3-planificación-y-metodología)
	- 3.1. [Metodología de desarrollo](#31-metodología-de-desarrollo)
	- 3.2. [Diseño técnico del sistema](#32-diseño-técnico-del-sistema)
	- 3.3. [Planificación temporal](#33-planificación-temporal)
4. [Desarrollo del proyecto](#4-desarrollo-del-proyecto)
	- 4.1. [Organización real del trabajo](#41-organización-real-del-trabajo)
	- 4.2. [Modelo de datos](#42-modelo-de-datos)
	- 4.3. [Implementación y despliegue](#43-implementación-y-despliegue)
5. [Fase de pruebas y control de calidad](#5-fase-de-pruebas-y-control-de-calidad)
	- 5.1. [Plan de pruebas](#51-plan-de-pruebas)
	- 5.2. [Registro de incidencias](#52-registro-de-incidencias)
	- 5.3. [Validación final](#53-validación-final)
6. [Conclusiones](#6-conclusiones)
	- 6.1. [Reflexión personal sobre el proyecto](#61-reflexión-personal-sobre-el-proyecto)
	- 6.2. [Dificultades encontradas y resolución](#62-dificultades-encontradas-y-resolución)
	- 6.3. [Grado de cumplimiento de objetivos](#63-grado-de-cumplimiento-de-objetivos)
	- 6.4. [Propuestas de mejora y evolución futura](#64-propuestas-de-mejora-y-evolución-futura)
7. [Referencias y bibliografía](#7-referencias-y-bibliografía)
8. [Anexos](#8-anexos)
	- 8.1. [Manual de instalación](#81-manual-de-instalación)
	- 8.2. [Manual de usuario](#82-manual-de-usuario)
	- 8.3. [Documentación complementaria digital](#83-documentación-complementaria-digital)
	- 8.4. [Anexos Técnicos y Documentales](#84-anexos-técnicos-y-documentales)

---

## Índice de Figuras
- [Figura 1. Logo Ianuarius](#figura1)


## Índice de Tablas
- (Aquí irán tus tablas)

---

# 1. Estudio del problema y análisis del sistema

### 1.1. Introducción
Aplicación web centrada en la gestión del club de atletismo Ianuarius, de forma que se digitalice su gestión.

Por otra parte, gracias a esta transición al mundo digital, permitirá añadir funcionalidades que, en un entorno físico, sin esta aplicación, serían muy costosos, complicados o incluso, imposibles de llevar a cabo, sobre todo teniendo en cuenta el gran número de atletas pertenecientes al club, de los cuales, su gran mayoría son menores, o lo suficientemente pequeños como para no estar capacitados para manejarse por sí mismos.

En cuanto a una oportunidad de negocio, este proyecto está inspirado desde la experiencia personal, de este modo, se ha podido observar que los clubes de atletismo, por lo general, no disponen de ningún sistema para gestionar y administrar a sus atletas de forma medianamente automatizada, por lo que este proyecto en sí, aporta algo totalmente nuevo al sector.

En cualquiera de los casos, cabe destacar que el proyecto ha sido ampliamente pensado para el club homónimo al título de este, por lo que, para otros clubes, cabría la posibilidad de que haya funciones insuficientes o que, por el contrario, haya un exceso de estas.

### 1.2. Objetivos y alcance
Siguiendo los criterios SMART (Específico, Medible, Alcanzable, Relevante y Temporal), se definen a continuación los objetivos del proyecto.

#### 1. Objetivo General

| Concepto | Descripción | Análisis SMART |
| :--- | :--- | :--- |
| **Propósito Principal** | Desarrollar una plataforma web integral para la digitalización de la gestión del Club Atletismo Ianuarius (inscripciones, fichas y seguimiento). | **S:** Web de gestión de fichas y atletas.<br>**M:** Gestión de licencias por vías digitales.<br>**A:** Stack LAMP (Linux, Apache, MySQL, PHP).<br>**R:** Elimina el uso de papel físico.<br>**T:** Funcional para la temporada 2026 - 2027 (Utilizable de ahí en adelante). |

#### 2. Objetivos Funcionales
Desglose de las funcionalidades principales ("Qué hace" el sistema):

| ID | Módulo | Descripción | Justificación SMART | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| **OBJ-01** | Usuarios | Registro, Login y distinción de roles (Admin, Entrenador, Atleta). | **S:** Acceso seguro por credenciales.<br>**M:** 3 roles diferenciados.<br>**T:** Fase 1 (Base de datos). | **Alta** |
| **OBJ-02** | Fichas | Subida de archivos escaneados para inscripciones físicas (legacy). | **S:** Upload de PDF/JPG.<br>**R:** Soporte a inscripciones manuales.<br>**T:** Fase 2. | **Alta** |
| **OBJ-03** | Fichas | Inscripción online con generación automática de PDF y envío por email. | **S:** Formulario a PDF automático.<br>**M:** 0 errores de transcripción.<br>**T:** Fase 2 (Lógica de negocio). | **Media** |
| **OBJ-04** | Gestión | Filtros de búsqueda avanzada (Categoría, edad, prueba, marcas). | **S:** Filtrado SQL dinámico.<br>**M:** Respuesta en < 1 seg.<br>**T:** Fase 3 (Panel Admin). | **Media** |
| **OBJ-05** | Atletas | Calendario de eventos y feedback de entrenamientos (sensaciones). | **S:** Calendario visual interactivo.<br>**R:** Seguimiento deportivo.<br>**T:** Fase Final. | **Baja** |

#### Objetivos No Funcionales
* Diseño Responsive (Mobile First).
* Interfaz limpia y accesible según estándares web.

### 1.3. Requisitos del sistema (SRS)
A continuación se detallan las especificaciones técnicas y normativas:

* **Funcionalidades:** CRUD de eventos, generación dinámica de PDF y subida segura de archivos.
* **No Funcionales (Técnicos):** Arquitectura MVC, sistema de autenticación seguro, validación de datos cliente/servidor, diseño responsivo.
* **Requisitos de ejecución:** Navegador web (móvil/PC), servidor (Apache o Nginx o en su defecto, lanzado desde un repositorio) con PHP, base de datos MySQL y conexión a internet.

---

# 2. Recursos necesarios

### 2.1. Recursos humanos, hardware y software
* **Lenguajes:** HTML, CSS, JS, PHP, SQL.
* **Herramientas:** VS Code, XAMPP, Obsidian.
* **Librerías/Frameworks:** Node, React, Tailwind CSS, librería de generación de PDFs.
* **Diseño:** Figma (mockup).

### 2.2. Estimación de costes y presupuesto
*(Contenido pendiente)*

---

# 3. Planificación y metodología

### 3.1. Metodología de desarrollo
*(Contenido pendiente)*

### 3.2. Diseño técnico del sistema
*(Contenido pendiente)*

### 3.3. Planificación temporal
*(Contenido pendiente)*

---

# 4. Desarrollo del proyecto

### 4.1. Organización real del trabajo
*(Contenido pendiente)*

### 4.2. Modelo de datos
*(Contenido pendiente)*

### 4.3. Implementación y despliegue
*(Contenido pendiente)*

---

# 5. Fase de pruebas y control de calidad

### 5.1. Plan de pruebas
*(Contenido pendiente)*

### 5.2. Registro de incidencias
*(Contenido pendiente)*

### 5.3. Validación final
*(Contenido pendiente)*

---

# 6. Conclusiones

### 6.1. Reflexión personal sobre el proyecto
*(Contenido pendiente)*

### 6.2. Dificultades encontradas y resolución
*(Contenido pendiente)*

### 6.3. Grado de cumplimiento de objetivos
*(Contenido pendiente)*

### 6.4. Propuestas de mejora y evolución futura
*(Contenido pendiente)*

---

# 7. Referencias y bibliografía
*(Contenido pendiente)*

---

# 8. Anexos

### 8.1. Manual de instalación
*(Contenido pendiente)*

### 8.2. Manual de usuario
*(Contenido pendiente)*

### 8.3. Documentación complementaria digital
*(Contenido pendiente)*

### 8.4. Anexos Técnicos y Documentales
*(Contenido pendiente)*
