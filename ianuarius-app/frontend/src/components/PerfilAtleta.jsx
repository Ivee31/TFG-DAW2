import { useState, useEffect } from 'react';
import { API } from '../api';

const SENSACIONES = ['😩', '😟', '😐', '😊', '🤩'];

const calcularCategoria = (fechaNacimiento, genero) => {
	const edad = new Date().getFullYear() - parseInt(fechaNacimiento?.split('-')[0] ?? 0);
	if (edad < 10)  return 'Sub-10';
	if (edad <= 11) return 'Sub-12';
	if (edad <= 13) return 'Sub-14';
	if (edad <= 15) return 'Sub-16';
	if (edad <= 17) return 'Sub-18';
	if (edad <= 19) return 'Sub-20';
	if (edad <= 22) return 'Sub-23';
	if (edad <= 34) return 'Absoluta';
	const tramo = Math.min(Math.floor((edad - 35) / 5) * 5 + 35, 65);
	return `${genero === 'M' ? 'M' : 'F'}${tramo}`;
};

function DocVacio() {
	return (
		<div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-700 rounded-xl">
			<span className="text-gray-500 text-xs uppercase tracking-widest">Sin documento</span>
		</div>
	);
}

export default function PerfilAtleta({ atletaId, onVolver }) {
	const [perfil, setPerfil]   = useState(null);
	const [marcas, setMarcas]   = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError]     = useState(null);
	const [tabDoc, setTabDoc]   = useState('carnet');

	useEffect(() => {
		setCargando(true);
		setError(null);
		Promise.all([
			fetch(`${API}/usuarios/atleta/${atletaId}`, { credentials: 'include' }).then(r => r.json()),
			fetch(`${API}/marcas/atleta/${atletaId}`,   { credentials: 'include' }).then(r => r.json()),
		]).then(([pd, md]) => {
			if (pd.status === 'success') setPerfil(pd.atleta);
			else setError(pd.error ?? 'Error al cargar perfil');
			if (md.status === 'success') setMarcas(md.marcas);
		}).catch(() => setError('Error de conexión'))
		  .finally(() => setCargando(false));
	}, [atletaId]);

	if (cargando) {
		return (
			<main className="flex items-center justify-center py-20">
				<span className="text-gray-500 text-xs uppercase tracking-[0.4em] animate-pulse">Cargando...</span>
			</main>
		);
	}

	if (error || !perfil) {
		return (
			<main className="space-y-4">
				<button onClick={onVolver} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs uppercase tracking-widest font-bold transition">
					← Volver
				</button>
				<p className="text-red-400 text-xs text-center py-10">{error ?? 'Atleta no encontrado'}</p>
			</main>
		);
	}

	const initials = ((perfil.nombre?.[0] || '') + (perfil.apellidos?.[0] || '')).toUpperCase();
	const avatarSrc = perfil.foto_carnet || perfil.foto_perfil || null;

	const DOCS = [
		{ key: 'carnet',     label: 'Carnet',         src: perfil.foto_carnet      },
		{ key: 'dni',        label: 'DNI',             src: perfil.foto_dni         },
		{ key: 'inscripcion',label: 'PDF Inscripción', src: perfil.inscripcion_pdf  },
	];

	const docActual = DOCS.find(d => d.key === tabDoc);

	return (
		<main className="space-y-6">

			{/* header */}
			<div className="flex items-center gap-4">
				<button
					onClick={onVolver}
					className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs uppercase tracking-widest font-bold transition"
				>
					← Volver
				</button>
			</div>

			<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
				<div className="flex items-center gap-4 mb-6 md:mb-8">
					{avatarSrc ? (
						<img src={avatarSrc} alt={perfil.nombre} className="w-14 h-14 rounded-full object-cover shrink-0" />
					) : (
						<div className="w-14 h-14 rounded-full bg-ianuarius/15 border border-ianuarius/25 flex items-center justify-center shrink-0">
							<span className="text-ianuarius text-base font-black">{initials}</span>
						</div>
					)}
					<div>
						<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
							{perfil.apellidos}, {perfil.nombre}
						</h2>
						<div className="flex items-center gap-2 mt-1">
							<span className="text-[10px] font-bold uppercase tracking-wider bg-ianuarius/15 text-ianuarius px-2 py-0.5 rounded-full">
								{calcularCategoria(perfil.fecha_nacimiento, perfil.genero)}
							</span>
							<span className="text-gray-400 text-[10px] uppercase tracking-widest">
								{perfil.genero === 'M' ? 'Masculino' : 'Femenino'}
							</span>
							<span className="text-gray-500 text-[10px]">{perfil.email}</span>
						</div>
					</div>
				</div>

				{/* contenido: marcas + documentos */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

					{/* marcas */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3">
							Marcas <span className="text-gray-500 font-normal">({marcas.length})</span>
						</h3>

						{marcas.length === 0 ? (
							<div className="flex items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl">
								<span className="text-gray-500 text-xs uppercase tracking-widest">Sin marcas registradas</span>
							</div>
						) : (
							<div className="overflow-x-auto rounded-xl border border-white/5">
								<table className="w-full text-xs">
									<thead>
										<tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest">
											<th className="text-left px-3 py-2 font-semibold">Prueba</th>
											<th className="text-left px-3 py-2 font-semibold">Categoría</th>
											<th className="text-left px-3 py-2 font-semibold">Marca</th>
											<th className="text-left px-3 py-2 font-semibold">Tipo</th>
											<th className="text-left px-3 py-2 font-semibold">Fecha</th>
											<th className="text-left px-3 py-2 font-semibold">Sensaciones</th>
										</tr>
									</thead>
									<tbody>
										{marcas.map((m, i) => (
											<tr key={m.id_marca} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-oscuro/30' : ''} hover:bg-white/5 transition`}>
												<td className="px-3 py-2 font-medium text-white">{m.prueba}</td>
												<td className="px-3 py-2 text-gray-400">{m.categoria_nombre ?? '—'}</td>
												<td className="px-3 py-2 font-bold text-ianuarius">{m.marca}</td>
												<td className="px-3 py-2 text-gray-400">{m.tipo_competicion}</td>
												<td className="px-3 py-2 text-gray-500">{m.fecha}</td>
												<td className="px-3 py-2">
													{m.sensaciones_valor ? (
														<div className="flex flex-col gap-0.5">
															<span className="text-base leading-none">{SENSACIONES[parseInt(m.sensaciones_valor) - 1]}</span>
															{m.sensaciones_notas && (
																<span className="text-gray-400 text-[10px] leading-tight max-w-[140px] break-words">{m.sensaciones_notas}</span>
															)}
														</div>
													) : (
														<span className="text-gray-700">—</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>

					{/* documentos */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3">
							Documentos
						</h3>

						{/* tabs */}
						<div className="flex items-center gap-1 bg-oscuro/60 border border-white/10 rounded-lg p-1 mb-4 w-fit">
							{DOCS.map(d => (
								<button
									key={d.key}
									onClick={() => setTabDoc(d.key)}
									className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition ${tabDoc === d.key ? 'bg-ianuarius text-white' : 'text-gray-400 hover:text-white'}`}
								>
									{d.label}
								</button>
							))}
						</div>

						{/* documento activo */}
						{!docActual?.src ? (
							<DocVacio />
						) : docActual.key === 'inscripcion' ? (
							<div className="rounded-xl overflow-hidden border border-white/5 bg-oscuro/30">
								<embed
									src={docActual.src}
									type="application/pdf"
									className="w-full"
									style={{ height: '420px' }}
								/>
								<a
									href={docActual.src}
									download={`inscripcion_${perfil.apellidos}_${perfil.nombre}.pdf`}
									className="block text-center py-2 text-[10px] text-ianuarius uppercase tracking-widest font-bold hover:underline"
								>
									Descargar PDF
								</a>
							</div>
						) : (
							<div className="rounded-xl overflow-hidden border border-white/5 bg-oscuro/30 flex flex-col items-center gap-2 p-3">
								<img
									src={docActual.src}
									alt={docActual.label}
									className="max-h-64 w-auto rounded-lg object-contain"
								/>
								<a
									href={docActual.src}
									download={`${docActual.key}_${perfil.apellidos}_${perfil.nombre}`}
									className="text-[10px] text-ianuarius uppercase tracking-widest font-bold hover:underline"
								>
									Descargar
								</a>
							</div>
						)}
					</div>

				</div>
			</div>
		</main>
	);
}
