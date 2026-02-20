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

<p align="right">
	<a href="https://ivee31.github.io/TFG-DAW2/" target="_blank">🌐 Ver Documentación Online</a>
	<p align="right">(pinchar con 'ctrl' para abrir en otra pestaña)</p>
</p>


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

## 1.1. Introducción
Aplicación web centrada en la gestión del club de atletismo Ianuarius, de forma que se digitalice su gestión.

Por otra parte, gracias a esta transición al mundo digital, permitirá añadir funcionalidades que, en un entorno físico, sin esta aplicación, serían muy costosos, complicados o incluso, imposibles de llevar a cabo, sobre todo teniendo en cuenta el gran número de atletas pertenecientes al club, de los cuales, su gran mayoría son menores, o lo suficientemente pequeños como para no estar capacitados para manejarse por sí mismos.

En cuanto a una oportunidad de negocio, este proyecto está inspirado desde la experiencia personal, de este modo, se ha podido observar que los clubes de atletismo, por lo general, no disponen de ningún sistema para gestionar y administrar a sus atletas de forma medianamente automatizada, por lo que este proyecto en sí, aporta algo totalmente nuevo al sector.

En cualquiera de los casos, cabe destacar que el proyecto ha sido ampliamente pensado para el club homónimo al título de este, por lo que, para otros clubes, cabría la posibilidad de que haya funciones insuficientes o que, por el contrario, haya un exceso de estas.

## 1.2. Objetivos y alcance
Siguiendo los criterios SMART (Específico, Medible, Alcanzable, Relevante y Temporal), se definen a continuación los objetivos del proyecto.

### 1.2.2. Objetivo General

| Concepto | Descripción | Análisis SMART |
| :--- | :--- | :--- |
| **Propósito Principal** | Desarrollar una plataforma web integral para la digitalización de la gestión del Club Atletismo Ianuarius (inscripciones, fichas y seguimiento). | **S:** Web de gestión de fichas y atletas.<br>**M:** Gestión de licencias por vías digitales.<br>**A:** Stack LAMP (Linux, Apache, MySQL, PHP).<br>**R:** Elimina el uso de papel físico.<br>**T:** Funcional para la temporada 2026 - 2027 (Utilizable de ahí en adelante). |

### 1.2.3. Objetivos Funcionales
Desglose de las funcionalidades principales ("Qué hace" el sistema):

| ID | Módulo | Descripción | Justificación SMART | Prioridad |
| :--- | :--- | :--- | :--- | :--- |
| **OBJ-01** | Usuarios | Registro, Login y distinción de roles (Admin, Entrenador, Atleta). | **S:** Acceso seguro por credenciales.<br>**M:** 3 roles diferenciados.<br>**T:** Fase 1 (Base de datos). | **Alta** |
| **OBJ-02** | Fichas | Subida de archivos escaneados para inscripciones físicas (legacy). | **S:** Upload de PDF/JPG.<br>**R:** Soporte a inscripciones manuales.<br>**T:** Fase 2. | **Alta** |
| **OBJ-03** | Fichas | Inscripción online con generación automática de PDF y envío por email. | **S:** Formulario a PDF automático.<br>**M:** 0 errores de transcripción.<br>**T:** Fase 2 (Lógica de negocio). | **Media** |
| **OBJ-04** | Gestión | Filtros de búsqueda avanzada (Categoría, edad, prueba, marcas). | **S:** Filtrado SQL dinámico.<br>**M:** Respuesta en < 1 seg.<br>**T:** Fase 3 (Panel Admin). | **Media** |
| **OBJ-05** | Atletas | Calendario de eventos y feedback de entrenamientos (sensaciones). | **S:** Calendario visual interactivo.<br>**R:** Seguimiento deportivo.<br>**T:** Fase Final. | **Baja** |

### 1.2.4. Objetivos No Funcionales
* Diseño Responsive (Mobile First).
* Interfaz limpia y accesible según estándares web.

## 1.3. Requisitos del sistema (SRS)
En este apartado se detallan las especificaciones técnicas, normativas y requisitos necesarios para el funcionamiento de la plataforma Ianuarius.

### 1.3.1. Normativa y Legislación
Debido a que el sistema gestiona inscripciones de atletas (en su mayoría menores) y realiza un seguimiento de sus entrenamientos, el cumplimiento normativo es estricto:
* **RGPD y LOPDGDD:** Los datos (identificativos, documentos de salud e imágenes) se alojarán en servidores del Espacio Económico Europeo (EEE). Se requerirá consentimiento verificable de tutores legales para menores de 14 años.
* **Derecho al olvido:** Debido a la necesidad de los datos personales aportados por cada individuo a la hora de federarse, se podrá solicitar la eliminación de dichos datos una vez el atleta inscrito abandone el club (de lo contrario, no podría pertenecer al club, ya que no tendría seguro medico aportado por la federación).
* **LSSI-CE y Accesibilidad:** Se incluirá un Aviso Legal con los datos del club. Se buscará cumplir con el nivel AA de las directrices WCAG 2.1 (contraste 4.5:1, etiquetas `alt` y navegación por teclado).
* **Licencias:** Tecnologías libres (HTML, CSS, PHP, MySQL), Tailwind CSS (MIT) y librerías de generación de PDF (MIT/GPL) compatibles con el proyecto.

### 1.3.2. Definición de Actores
| ID: ACT-01 | Visitante |
| :--- | :--- |
| **Descripción** | Usuario no registrado que accede a la parte pública (portfolio informativo). |
| **Permisos** | Visualizar información basica del club (plazos de fichas, horarios, periodos de entreno, etc.). |

<br>

| ID: ACT-02 | Atleta |
| :--- | :--- |
| **Descripción** | Integrante del club registrado de forma oficial. |
| **Permisos** | Iniciar sesión, realizar inscripciones (formulario o subida de PDF), acceder a su historial, editar inscripciones en plazo y registrar feedback de entrenamientos. |

<br>

| ID: ACT-03 | Entrenador (Administrador) |
| :--- | :--- |
| **Descripción** | Miembro del cuerpo técnico encargado de la gestión del club. |
| **Permisos** | Permisos de Atleta + visualizar todas las fichas, filtrar atletas (edad, categoría) y consultar el calendario global. |

### 1.3.3. Requisitos Funcionales (RF)
| ID | Función | Descripción Detallada | Actor | CU | Prioridad |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Registro | El sistema permitirá crear una cuenta mediante formulario validando el email. | Visitante | UC-01 | **Alta** |
| **RF-02** | Login | El sistema verificará credenciales contra la BBDD y asignará la sesión. | Atleta/Admin | UC-01 | **Alta** |
| **RF-03** | Inscripción | El sistema generará un PDF automático a partir de los datos del formulario. | Atleta | UC-02 | **Alta** |
| **RF-04** | Subida PDF | El sistema permitirá adjuntar archivos físicos escaneados (JPG/PDF). | Atleta | UC-03 | **Media** |
| **RF-05** | Filtros | El sistema ordenará las fichas por categoría, fecha o edad. | Admin | UC-04 | **Media** |
| **RF-06** | Generación PDF | El sistema generará ficha de inscripción en PDF en base a los datos aportados en el formulario de inscripción. | Atleta | UC-03 | **Baja** |

### 1.3.4. Requisitos No Funcionales (RNF)
| ID | Tipo | Descripción y Métrica |
| :--- | :--- | :--- |
| **RNF-01** | Seguridad | Las contraseñas se almacenarán cifradas mediante hash en la BBDD. |
| **RNF-02** | Rendimiento | La generación del PDF de inscripción habría de tardar menos de 5000ms. |
| **RNF-03** | Disponibilidad | El sistema será responsivo (Mobile First) para uso en pistas de atletismo. |

### 1.3.5. Requisitos de Información (IRQ)
| ID: IRQ-01 | Información de Usuarios y Fichas |
| :--- | :--- |
| **Descripción** | El sistema debe almacenar permanentemente los datos de registro e inscripción. |
| **Datos concretos** | • ID Usuario (PK)<br>• Nombre, Apellidos, DNI, Email (Único), Contraseña (Hash)<br> • Rol (Atleta o Entrenador/Admin)<br> • Ruta del PDF de inscripción generado |
| **Comentarios** | Los campos DNI y Email son obligatorios y únicos. |

---

# 2. Recursos necesarios

## 2.1. Recursos humanos, hardware y software
* **Lenguajes:** HTML, CSS, JS, PHP, SQL.
* **Herramientas:** VS Code, XAMPP, Obsidian.
* **Librerías/Frameworks:** Node, React, Tailwind CSS, librería de generación de PDFs.
* **Diseño:** Figma (mockup).

## 2.2. Estimación de costes y presupuesto
Aunque el proyecto se desarrolla en un ámbito académico, a continuación se presenta una estimación del presupuesto como si se tratase de un encargo profesional para el Club Atletismo Ianuarius.

### 2.2.1. Costes de Hardware y Software**
Se ha optado por un entorno de desarrollo basado en software libre y herramientas de código abierto (Open Source), reduciendo drásticamente los costes de licencias.

| Concepto | Descripción | Coste Estimado |
| :--- | :--- | :--- |
| **Hardware** | Amortización de equipo informático (Portátil desarrollo). | 250,00 € |
| **Software IDE** | Visual Studio Code, Obsidian. | 0,00 € (Free) |
| **Entorno Servidor** | XAMPP (Apache, MySQL, PHP). | 0,00 € (Free) |
| **Diseño / UI** | Figma (Plan gratuito), Tailwind CSS. | 0,00 € (Free) |
| **Despliegue (Fase 1)** | GitHub Pages (Frontend) / Servidor local. | 0,00 € (Free) |
| **Total Recursos** | | **250,00 €** |

**2. Costes de Personal (Desarrollo)**
Estimación basada en la tarifa horaria de un perfil *Junior Web Developer* (aprox. 18 €/hora) para una carga de trabajo de unas 150 horas a lo largo del proyecto.

| Fase | Horas Estimadas | Coste (18 € / h) |
| :--- | :--- | :--- |
| Análisis y Diseño | 40 h | 720,00 € |
| Desarrollo Backend y BBDD | 50 h | 900,00 € |
| Desarrollo Frontend y Vistas | 40 h | 720,00 € |
| Pruebas y Documentación | 20 h | 360,00 € |
| **Total Desarrollo** | **150 h** | **2.700,00 €** |

**Presupuesto Total Estimado: 2.950,00 €** (Impuestos no incluidos).

---

# 3. Planificación y metodología

## 3.1. Metodología de desarrollo
Para la ejecución de la plataforma Ianuarius, se ha optado por una **Metodología Ágil basada en un modelo Scrum adaptado** a un único desarrollador. 

Las razones de esta elección son:
1. **Desarrollo iterativo e incremental:** Permite tener versiones funcionales (prototipos) desde las primeras semanas, añadiendo módulos (login, PDF, filtros) de forma progresiva.
2. **Flexibilidad ante cambios:** Al interactuar con el tutor/cliente, es posible ajustar los requisitos sobre la marcha (por ejemplo, añadir campos nuevos a la ficha médica) sin romper la estructura de trabajo.

**Herramientas de gestión:**
Se utilizará un tablero tipo Kanban (GitHub Projects) dividido en las columnas básicas: *Backlog* (Tareas pendientes), *In Progress* (En desarrollo), *Testing* (Pruebas) y *Done* (Completado).

## 3.2. Diseño técnico del sistema

En esta fase se modelan las interacciones de los usuarios con el sistema para definir la arquitectura lógica de la aplicación.

### 3.2.1. Diagrama de Casos de Uso
*(A continuación se insertará el diagrama UML mostrando los límites del sistema y las relaciones entre Visitante, Atleta y Administrador).*

<p align="center">
  <img src="img/diagrama_uml.png" alt="Diagrama de Casos de Uso" width="800">
  <br>
  <em>Figura 3. Diagrama de Casos de Uso del Sistema</em>
</p>

### 3.2.2. Especificación de Casos de Uso

| UC-01 | Registro y Autenticación |
| :--- | :--- |
| **Actor** | Visitante (pasa a ser Atleta/Entrenador) |
| **Interés** | Crear una cuenta segura, para acceder a un más amplio registro de funciones del club. |
| **Precondición** | No tener una cuenta previamente registrada con el email aportado. |
| **Garantía** | Datos almacenados (contraseñas cifradas) y sesión iniciada. |
| **Flujo Básico** | 1. El sistema solicita datos (Nombre, Email, Pass).<br>2. El sistema valida el formato.<br>3. El sistema crea la cuenta y autentica. |
| **Excepciones** | 2.a Email existente: El sistema avisa y ofrece recuperar contraseña. |

<br>

| UC-02 | Generar Inscripción Online |
| :--- | :--- |
| **Actor** | Atleta / Entrenador |
| **Interés** | Completar la ficha digitalmente y generar el documento oficial. |
| **Precondición** | Haber iniciado sesión (UC-01). |
| **Garantía** | PDF generado, guardado en el perfil y enviado por correo. |
| **Flujo Básico** | 1. Usuario accede al formulario.<br>2. Sistema solicita datos y subida de imágenes (DNI).<br>3. Sistema compila datos y genera el PDF.<br>4. Sistema envía el PDF al email. |
| **Excepciones** | 2.a Archivo no soportado: El sistema rechaza la imagen e indica formatos válidos (JPG/PNG). |

## 3.3. Planificación temporal
*(Contenido pendiente)*

---

# 4. Desarrollo del proyecto

## 4.1. Organización real del trabajo
*(Contenido pendiente)*

## 4.2. Modelo de datos
*(Contenido pendiente)*

## 4.3. Implementación y despliegue
*(Contenido pendiente)*

---

# 5. Fase de pruebas y control de calidad

## 5.1. Plan de pruebas
*(Contenido pendiente)*

## 5.2. Registro de incidencias
*(Contenido pendiente)*

## 5.3. Validación final
*(Contenido pendiente)*

---

# 6. Conclusiones

## 6.1. Reflexión personal sobre el proyecto
*(Contenido pendiente)*

## 6.2. Dificultades encontradas y resolución
*(Contenido pendiente)*

## 6.3. Grado de cumplimiento de objetivos
*(Contenido pendiente)*

## 6.4. Propuestas de mejora y evolución futura
*(Contenido pendiente)*

---

# 7. Referencias y bibliografía
*(Contenido pendiente)*

---

# 8. Anexos

## 8.1. Manual de instalación
*(Contenido pendiente)*

## 8.2. Manual de usuario
*(Contenido pendiente)*

## 8.3. Documentación complementaria digital
*(Contenido pendiente)*

## 8.4. Anexos Técnicos y Documentales
*(Contenido pendiente)*
