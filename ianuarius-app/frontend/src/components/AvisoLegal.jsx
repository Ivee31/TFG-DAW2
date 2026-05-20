export default function AvisoLegal({ onBack }) {
	return (
		<div className="bg-oscuro text-gray-200 font-sans antialiased min-h-screen">
			<div className="max-w-3xl mx-auto px-6 py-16">

				<button onClick={onBack} className="text-gray-400 hover:text-white text-xs uppercase tracking-widest transition mb-12 flex items-center gap-2">
					← Volver
				</button>

				<h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2" style={{ fontFamily: "'Graduate', sans-serif" }}>
					Aviso Legal
				</h1>

				<p className="text-ianuarius text-xs uppercase tracking-[0.4em] mb-12">Ianuarius Athletics</p>

				<div className="space-y-10 text-sm text-gray-400 leading-relaxed">

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">1. Identificación del titular</h2>
						<p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:</p>
						<ul className="mt-3 space-y-1 pl-4">
							<li><span className="text-white">Denominación:</span> Atletismo Ianuarius Salamanca</li>
							<li><span className="text-white">Responsable del desarrollo:</span> Iván Martín Nieto</li>
							<li><span className="text-white">Centro:</span> I.E.S. Venancio Blanco — Ciclo DAW2</li>
							<li><span className="text-white">Contacto:</span> ivan.marnie.2@educa.jcyl.es</li>
							<li><span className="text-white">Ámbito:</span> Proyecto de Fin de Grado (TFG) — uso académico</li>
						</ul>
					</section>

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">2. Objeto y condiciones de uso</h2>
						<p>La plataforma <strong className="text-white">Ianuarius</strong> es una aplicación web de gestión deportiva desarrollada con fines académicos para el club de atletismo Ianuarius de Salamanca. Su uso está restringido a miembros del club (atletas, entrenadores y administradores) debidamente registrados.</p>
						<p className="mt-3">El usuario se compromete a hacer un uso lícito de la plataforma, absteniéndose de cualquier conducta que pudiera dañar los sistemas, la información de otros usuarios o el correcto funcionamiento del servicio.</p>
					</section>

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">3. Propiedad intelectual</h2>
						<p>El diseño, código fuente y contenidos de esta plataforma son obra de Iván Martín Nieto y se distribuyen bajo licencia <strong className="text-white">Creative Commons Reconocimiento-CompartirIgual 3.0 España (CC BY-SA 3.0 ES)</strong>. Queda prohibida su reproducción total o parcial con fines comerciales sin autorización expresa.</p>
					</section>

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">4. Protección de datos (RGPD)</h2>
						<p>Los datos personales recabados (nombre, apellidos, DNI, email, fecha de nacimiento y género) son necesarios para la gestión del club y se tratan conforme al <strong className="text-white">Reglamento (UE) 2016/679 (RGPD)</strong> y la <strong className="text-white">Ley Orgánica 3/2018 (LOPDGDD)</strong>.</p>
						<ul className="mt-3 space-y-1 pl-4">
							<li><span className="text-white">Finalidad:</span> gestión de socios, marcas deportivas y comunicaciones del club.</li>
							<li><span className="text-white">Legitimación:</span> consentimiento del interesado y ejecución de la relación contractual.</li>
							<li><span className="text-white">Conservación:</span> mientras se mantenga la condición de miembro activo.</li>
							<li><span className="text-white">Derechos:</span> acceso, rectificación, supresión, oposición y portabilidad mediante solicitud a ivan.marnie.2@educa.jcyl.es.</li>
						</ul>
					</section>

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">5. Política de cookies</h2>
						<p>Esta plataforma utiliza únicamente una <strong className="text-white">cookie de sesión técnica</strong> (<code className="text-ianuarius text-xs">PHPSESSID</code>) imprescindible para el funcionamiento del sistema de autenticación. Se elimina automáticamente al cerrar el navegador. No se utilizan cookies analíticas, publicitarias ni de terceros.</p>
					</section>

					<section>
						<h2 className="text-white font-bold uppercase tracking-widest text-xs mb-3 border-b border-white/20 pb-2">6. Exención de responsabilidad</h2>
						<p>Al tratarse de un proyecto académico en entorno de demostración, el titular no garantiza la disponibilidad continua del servicio ni se responsabiliza de los daños derivados de un uso indebido de la plataforma.</p>
					</section>

				</div>

				<p className="text-gray-400 text-xs mt-16 border-t border-white/15 pt-8">
					Última actualización: mayo 2026 · Ianuarius Athletics Club © 2026
				</p>

			</div>
		</div>
	);
}
