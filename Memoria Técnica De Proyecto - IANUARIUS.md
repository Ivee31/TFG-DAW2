<a id="figura1-logo"></a>
<figure style="text-align: center">
	<img src="img/logoIanuarius.png" width="400" alt="Logotipo">
	<figcaption style="color: gray">Figura 1. Logotipo "Atletismo Salamanca Ianuarius"</figcaption>
</figure>

<div style="text-align: right">
	<p style="font-size: 13; font-weight: medium">CICLO FORMATIVO DE GRADO SUPERIOR</p>
	<p style="font-weight: bold; font-size: 18">Desarrollo de Aplicaciones Web</p>
	<p style="font-size: 13">I.E.S. «Venancio Blanco» SALAMANCA</p>
	<a id="figura2-venancio"></a>
	<img src="img/logoVenancio.png" width="50" alt="Logotipo" style="background-color: white; margin-right: 135">
	<p style="font-size: 13; font-weight: bold">TUTOR</p>
	<p>Serafina Martín Marcos</p>
	<p style="font-size: 13; font-weight: bold">AUTOR</p>
	<p>Iván Martín Nieto</p>
</div>

### Licencia
Esta obra está bajo una licencia Reconocimiento-Compartir bajo la misma licencia 3.0 España de Creative Commons. Para ver una copia de la licencia, visite http://creativecommons.org/licenses/by-sa/3.0/es/ o envíe una carta a Creative Commons, 171 Second Street, Suite 300, San Francisco, California 94105, USA.

## Índice de Contenido
- [Índice de Figuras](#indice-figuras)
- [Índice de Tablas](#indice-tablas)

1. [Estudio del problema y análisis del sistema](#estudio-problema)
	1. [Introducción](#introduccion)
	2. [Objetivos y alcance](#objetivos-alcance)
	3. [Requisitos del sistema (SRS)](#requisitos-sistema)
2. [Recursos necesarios](#recursos-necesarios)
	1. [Recursos humanos, hardware y software](#recursos-humanos)
	2. [Estimación de costes y presupuesto](#estimacion-costes)
3. [Planificación y metodología](#planif-metodo)
	1. [Metodología de desarrollo](#metodologia-desarrollo)
	2. [Diseño técnico del sistema](#diseno-tecnico)
	3. [Planificación temporal](#planificacion-temporal)
4. [Desarrollo del proyecto](#desarrollo-proyecto)
	1. [Organización real del trabajo](#organizacion-real)
	2. [Modelo de datos](#modelo-datos)
	3. [Implementación y despliegue](#implementacion-despliegue)
5. [Fase de pruebas y control de calidad](#fase-pruebas)
	1. [Plan de pruebas](#plan-pruebas)
	2. [Registro de incidencias](#registro-incidencias)
	3. [Validación final](#validacion-final)
6. [Conclusiones](#conclusiones)
	1. [Reflexión personal sobre el proyecto](#reflexion-personal)
	2. [Dificultades encontradas y resolución](#dificultades)
	3. [Grado de cumplimiento de objetivos](#objetivos-cumplidos)
	4. [Propuestas de mejora y evolución futura](#propuestas-mejora)
7. [Referencias y bibliografía](#referencias)
8. [Anexos](#anexos)
	1. [Manual de instalación](#manual-instalacion)
	2. [Manual de usuario](#manual-usuario)
	3. [Documentación complementaria digital](#doc-complementaria)
	4. [Anexos Técnicos y Documentales](#anexos-tecnicos)


<a id="indice-figuras"></a>
## Índice de Figuras

- [Figura 1. Logo Ianuarius](#figura1-logo)
- [Figura 2. Logo Venancio Blanco](#figura2-venancio)


<a id="indice-tablas"></a>
## Índice de Tablas

- (Aquí irán tus tablas)


<a id="estudio-problema"></a>
<h2>1. Estudio del problema y análisis del sistema </h2>
	<ul style="list-style: none">
		<a id="introduccion"></a>
		<li>
			<h4>1.1. Introducción</h4>
			<p>Aplicación web centrada en la gestión del club de atletismo Ianuarius, de forma que se digitalice su gestión.</p>
			<p>Por otra parte, gracias a esta transición al mundo digital, permitirá añadir funcionalidades que, en un entorno físico, sin esta aplicación, se rían muy costosos, complicados o incluso, imposibles de llevar a cabo, sobre todo teniendo en cuenta el gran número de atletas pertenecientes al club, de los cuales, su gran mayoría son menores, o lo suficientemente pequeños como para no estar capacitados para manejarse por sí mismos.</p>
			<p>En cuanto a una oportunidad de negocio, este proyecto está inspirado desde la experiencia personal, de este modo, se ha podido observar que los clubes de atletismo, por lo general, no disponen de ningún sistema para gestionar y administrar a sus atletas de forma medianamente automatizada, por lo que este proyecto en sí, aporta algo totalmente nuevo al sector.</p>
			<p>En cualquiera de los casos, cabe destacar que el proyecto ha sido ampliamente pensado para el club homónimo al título de este, por lo que, para otros clubes, cabría la posibilidad de que haya funciones insuficientes o que, por el contrario, haya un exceso de estas.</p>
		</li>
		<a id="objetivos-alcance"></a>
		<li>
			<h4>1.2. Objetivos y alcance</h4>
			<p>(Objetivos funcionales, no funcionales y el alcance exacto de qué incluye y qué no el proyecto.)</p>
			<ul style="list-style: none">
				<h5>Objetivos Funcionales</h5>
				<li>
					<p>- Registro y LogIn de cuentas con distinción de roles</p>
					<p style="color: gray">(adjuntar guía visual)</p>
				</li>
				<li>
					<p>- Sistema de inscripción y creación de ficha de club mediante rellenado de formulario</p>
					<p style="color: gray">(adjuntar guía visual)</p>
				</li>
				<li>
					<p>- En defecto del anterior, sistema de subida de archivos PDF con la ficha previamente rellenada en físico</p>
					<p style="color: gray">(adjuntar guía visual)</p>
				</li>
				<li>
					<p>- En defecto del anterior, sistema de subida de archivos PDF con la ficha ya rellenada en físico</p>
					<p style="color: gray">(adjuntar guia visual)</p>
				</li>
			</ul>
		</li>
		<a id="requisitos-sistema"></a>
		<li>
			<h4>1.3. Requisitos del sistema (SRS)</h4>
			<p>(Incluye aquí el Documento de Especificación de Requisitos: funcionales, no funcionales, restricciones técnicas y normativa aplicable como RGPD).</p>
		</li>
	</ul>

<a id="recursos-necesarios"></a>
<h2>2. Recursos necesarios</h2>
	<ul style="list-style: none">
		<a id="recursos-humanos"></a>
		<li>
			<h4>2.1. Recursos humanos, hardware y software</h4>
			<p>(Detalla roles, equipos, sistemas operativos, lenguajes, frameworks y herramientas)</p>
		</li>
		<a id="estimacion-costes"></a>
		<li>
			<h4>2.2. Estimación de costes y presupuesto</h4>
			<p>(Calcula costes de hardware, software, licencias y horas de desarrollo)</p>
		</li>
	</ul>

<a id="planif-metodo"></a>
<h2>3. Planificación y metodología</h2>
	<ul style="list-style: none">
		<a id="metodologia-desarrollo"></a>
		<li>
			<h4>3.1. Metodología de desarrollo</h4>
			<p>(Justifica y describe la metodología: Ágil, Scrum, Cascada, etc.)</p>
		</li>
		<a id="diseno-tecnico"></a>
		<li>
			<h4>3.2. Diseño técnico del sistema</h4>
			<p>(Inserta aquí: Arquitectura, Diagrama de casos de uso, Diagrama de clases, Diagrama de secuencia, Prototipos Figma/Wireframes y Patrones)</p>
		</li>
		<a id="planificacion-temporal"></a>
		<li>
			<h4>3.3. Planificación temporal</h4>
			<p>(Inserta el Diagrama de Gantt inicial y final, comparando la previsión con la realidad)</p>
		</li>
	</ul>

<a id="desarrollo-proyecto"></a>
<h2>4. Desarrollo del proyecto</h2>
	<ul style="list-style: none">
		<a id="organizacion-real"></a>
		<li>
			<h4>4.1. Organización real del trabajo</h4>
			<p>(Describe las fases reales, cambios, problemas y ajustes)</p>
		</li>
		<a id="modelo-datos"></a>
		<li>
			<h4>4.2. Modelo de datos</h4>
			<p>(Inserta el Diagrama Entidad-Relación, modelo relacional y explicación de tablas)</p>
		</li>
		<a id="implementacion-despliegue"></a>
		<li>
			<h4>4.3. Implementación y despliegue</h4>
			<p>(Describe tecnologías, estructura de carpetas, fragmentos clave de código, diagrama de despliegue y entorno de ejecución)</p>
		</li>
	</ul>

<a id="fase-pruebas"></a>
<h2>5. Fase de pruebas y control de calidad</h2>
	<ul style="list-style: none">
		<a id="plan-pruebas"></a>
		<li>
			<h4>5.1. Plan de pruebas</h4>
			<p>(Describe pruebas unitarias y de integración)</p>
		</li>
		<a id="registro-incidencias"></a>
		<li>
			<h4>5.2. Registro de incidencias</h4>
			<p>(Inserta tabla con: Error, Fecha, Causa, Solución)</p>
		</li>
		<a id="validacion-final"></a>
		<li>
			<h4>5.3. Validación final</h4>
			<p>(Análisis de cumplimiento de requisitos)</p>
		</li>
	</ul>

<a id="conclusiones"></a>
<h2>6. Conclusiones</h2>
	<ul style="list-style: none">
		<a id="reflexion-personal"></a>
		<li>
			<h4>6.1. Reflexión personal sobre el proyecto</h4>
			<p>()</p>
		</li>
		<a id="dificultades"></a>
		<li>
			<h4>6.2. Dificultades encontradas y resolución</h4>
			<p>()</p>
		</li>
		<a id="objetivos-cumplidos"></a>
		<li>
			<h4>6.3. Grado de cumplimiento de objetivos</h4>
			<p>()</p>
		</li>
		<a id="propuestas-mejora"></a>
		<li>
			<h4>6.4. Propuestas de mejora y evolución futura</h4>
			<p>()</p>
		</li>
	</ul>

<a id="referencias"></a>
<h2>7. Referencias y bibliografía</h2>
	<p>(Lista ordenada de manuales, documentación técnica, normativa y recursos web).</p>

<a id="anexos"></a>
<h2>8. Anexos</h2>
	<ul style="list-style: none">
		<a id="manual-instalacion"></a>
		<li>
			<h4>8.1. Manual de instalación</h4>
			<p>(Guía paso a paso para desplegar el sistema).</p>
		</li>
		<a id="manual-usuario"></a>
		<li>
			<h4>8.2. Manual de usuario</h4>
			<p>(Guía de uso para el usuario final)</p>
		</li>
		<a id="doc-complementaria"></a>
		<li>
			<h4>8.3. Documentación complementaria digital</h4>
			<p>(Indica aquí los enlaces o referencias al repositorio, código fuente, scripts SQL y multimedia).</p>
		</li>
		<a id="anexos-tecnicos"></a>
		<li>
			<h4>8.4. Anexos Técnicos y Documentales</h4>
			<p>(Anexo I, Anexo II... Para diagramas grandes, listados de código extensos, etc.).</p>
		</li>
	</ul>

s