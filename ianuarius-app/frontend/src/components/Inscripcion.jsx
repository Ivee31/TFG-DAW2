export default function Inscripcion() {
	const inscripcionCompleta = false; // conectar con datos reales en RF-05

	return (
		<div className="space-y-6 max-w-2xl">

			{!inscripcionCompleta && (
				<div className="flex items-center gap-3 px-5 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-yellow-400 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
					</svg>
					<p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Inscripción pendiente para la temporada actual</p>
				</div>
			)}

			<div className="bg-gris rounded-lg border border-white/10 p-6">
				<p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Inscripción de Temporada</p>
				<h2 className="text-2xl font-black tracking-tight text-white mb-3">Formaliza tu inscripción</h2>
				<p className="text-gray-400 text-sm leading-relaxed">
					Para participar en los entrenamientos y competiciones de la temporada debes completar tu inscripción.
					Puedes hacerlo rellenando el formulario online o subiendo el PDF oficial firmado.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

				<div className="bg-gris rounded-lg border border-white/10 p-6 space-y-4 relative overflow-hidden">
					<div className="absolute inset-0 bg-oscuro/70 backdrop-blur-[1px] flex items-center justify-center z-10">
						<span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border border-gray-700 px-3 py-1 rounded">Próximamente</span>
					</div>

					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-ianuarius/10 border border-ianuarius/30 rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-ianuarius">
								<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-black uppercase tracking-wide text-white">Formulario Online</h3>
							<p className="text-gray-500 text-[10px] uppercase tracking-wider">Recomendado</p>
						</div>
					</div>

					<p className="text-gray-500 text-xs leading-relaxed">
						Rellena el formulario médico y de inscripción directamente desde la plataforma. Proceso guiado paso a paso.
					</p>

					<button disabled className="w-full bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest py-3 rounded opacity-40">
						Rellenar formulario
					</button>
				</div>

				<div className="bg-gris rounded-lg border border-white/10 p-6 space-y-4 relative overflow-hidden">
					<div className="absolute inset-0 bg-oscuro/70 backdrop-blur-[1px] flex items-center justify-center z-10">
						<span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border border-gray-700 px-3 py-1 rounded">Próximamente</span>
					</div>

					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-black uppercase tracking-wide text-white">Subir PDF</h3>
							<p className="text-gray-500 text-[10px] uppercase tracking-wider">Firmado y escaneado</p>
						</div>
					</div>

					<p className="text-gray-500 text-xs leading-relaxed">
						Descarga el formulario oficial, complétalo a mano, fírmalo y sube el PDF escaneado.
					</p>

					<button disabled className="w-full border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest py-3 rounded opacity-40">
						Subir PDF firmado
					</button>
				</div>

			</div>
		</div>
	);
}
