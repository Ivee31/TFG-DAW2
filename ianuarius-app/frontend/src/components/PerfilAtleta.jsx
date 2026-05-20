import { useState, useEffect, useMemo } from 'react';
import { API } from '../api';
import JSZip from 'jszip';

const MARCAS_POR_PAG = 8;
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

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
			<span className="label-muted">Sin documento</span>
		</div>
	);
}

export default function PerfilAtleta({ atletaId, onVolver }) {
	const [perfil, setPerfil]   = useState(null);
	const [marcas, setMarcas]   = useState([]);
	const [cargando, setCargando] = useState(true);
	const [error, setError]     = useState(null);
	const [tabDoc, setTabDoc]   = useState('carnet');
	const [zipping, setZipping] = useState(false);

	const [filterYear, setFilterYear]           = useState('');
	const [filterMonth, setFilterMonth]         = useState('');
	const [filterTemporada, setFilterTemporada] = useState('');
	const [marcaPage, setMarcaPage]             = useState(0);

	useEffect(() => { setMarcaPage(0); }, [filterYear, filterMonth, filterTemporada]);

	const yearsDisponibles = useMemo(() =>
		[...new Set(marcas.map(m => m.fecha?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a),
		[marcas]
	);

	const marcasFiltradas = useMemo(() => marcas.filter(m => {
		if (filterYear && m.fecha?.slice(0, 4) !== filterYear) return false;
		if (filterMonth && m.fecha?.slice(5, 7) !== filterMonth) return false;
		if (filterTemporada && m.temporada !== filterTemporada) return false;
		return true;
	}), [marcas, filterYear, filterMonth, filterTemporada]);

	const totalPaginas  = Math.max(1, Math.ceil(marcasFiltradas.length / MARCAS_POR_PAG));
	const marcasVisible = marcasFiltradas.slice(marcaPage * MARCAS_POR_PAG, (marcaPage + 1) * MARCAS_POR_PAG);

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
				<span className="text-gray-400 text-xs uppercase tracking-[0.4em] animate-pulse">Cargando...</span>
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

	const descargarZip = async () => {
		setZipping(true);
		try {
			const zip = new JSZip();
			const carpeta = `${perfil.apellidos}_${perfil.nombre}`;
			const folder = zip.folder(carpeta);

			const b64toBlob = (b64) => {
				const [header, data] = b64.split(',');
				const mime = header.match(/:(.*?);/)[1];
				const bin  = atob(data);
				const arr  = new Uint8Array(bin.length);
				for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
				return { blob: new Blob([arr], { type: mime }), mime };
			};

			if (perfil.foto_dni) {
				const { blob, mime } = b64toBlob(perfil.foto_dni);
				folder.file(`dni.${mime.split('/')[1] === 'pdf' ? 'pdf' : mime.split('/')[1]}`, blob);
			}
			if (perfil.foto_carnet) {
				const { blob, mime } = b64toBlob(perfil.foto_carnet);
				folder.file(`carnet.${mime.split('/')[1]}`, blob);
			}
			if (perfil.inscripcion_pdf) {
				const { blob, mime } = b64toBlob(perfil.inscripcion_pdf);
				folder.file(`inscripcion.${mime.split('/')[1] === 'pdf' ? 'pdf' : mime.split('/')[1]}`, blob);
			}

			const content = await zip.generateAsync({ type: 'blob' });
			const url = URL.createObjectURL(content);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${carpeta}.zip`;
			a.click();
			URL.revokeObjectURL(url);
		} catch {}
		setZipping(false);
	};

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
			<div className="flex items-center justify-between gap-4">
				<button
					onClick={onVolver}
					className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs uppercase tracking-widest font-bold transition"
				>
					← Volver
				</button>
				{(perfil.foto_dni || perfil.foto_carnet || perfil.inscripcion_pdf) && (
					<button
						onClick={descargarZip}
						disabled={zipping}
						className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded hover:border-white/40 hover:bg-white/5 transition disabled:opacity-40"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
						</svg>
						{zipping ? 'Generando...' : 'Descargar documentos (.zip)'}
					</button>
				)}
			</div>

			<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/15 shadow-2xl">
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
							<span className="text-gray-400 text-[10px]">{perfil.email}</span>
						</div>
					</div>
				</div>

				{/* contenido: marcas + documentos */}
				<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

					{/* marcas */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3">
							Marcas <span className="text-gray-400 font-normal">
								{marcasFiltradas.length !== marcas.length
									? `${marcasFiltradas.length} de ${marcas.length}`
									: marcas.length}
							</span>
						</h3>

						{marcas.length > 0 && (
							<div className="space-y-2 mb-4">
								<div className="flex gap-2">
									<select
										value={filterYear}
										onChange={e => setFilterYear(e.target.value)}
										aria-label="Filtrar por año"
										className="flex-1 bg-oscuro text-white text-[10px] border border-gray-700 rounded px-2 py-1.5 focus:border-ianuarius outline-none"
									>
										<option value="">Todos los años</option>
										{yearsDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
									</select>

									<select
										value={filterMonth}
										onChange={e => setFilterMonth(e.target.value)}
										aria-label="Filtrar por mes"
										className="flex-1 bg-oscuro text-white text-[10px] border border-gray-700 rounded px-2 py-1.5 focus:border-ianuarius outline-none"
									>
										<option value="">Todos los meses</option>
										{MESES.map((m, i) => (
											<option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>
										))}
									</select>
								</div>

								<div className="flex gap-1.5" role="group" aria-label="Filtrar por modalidad">
									{[['', 'Todas'], ['outdoor', 'Outdoor'], ['short_track', 'Indoor']].map(([val, label]) => (
										<button
											key={val}
											onClick={() => setFilterTemporada(val)}
											aria-pressed={filterTemporada === val}
											className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition ${
												filterTemporada === val
													? 'bg-ianuarius text-white'
													: 'border border-white/20 text-gray-400 hover:text-white hover:border-white/30'
											}`}
										>
											{label}
										</button>
									))}
								</div>
							</div>
						)}

						{marcas.length === 0 ? (
							<div className="flex items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl">
								<span className="label-muted">Sin marcas registradas</span>
							</div>
						) : marcasVisible.length === 0 ? (
							<div className="flex items-center justify-center py-10 border border-dashed border-gray-700 rounded-xl">
								<span className="label-muted">Sin marcas para los filtros seleccionados</span>
							</div>
						) : (
							<>
								<div className="overflow-x-auto rounded-xl border border-white/15">
									<table className="w-full text-xs">
										<thead>
											<tr className="border-b border-white/15 text-gray-400 uppercase tracking-widest">
												<th className="text-left px-3 py-2 font-semibold">Prueba</th>
												<th className="text-left px-3 py-2 font-semibold">Categoría</th>
												<th className="text-left px-3 py-2 font-semibold">Marca</th>
												<th className="text-left px-3 py-2 font-semibold">Tipo</th>
												<th className="text-left px-3 py-2 font-semibold">Fecha</th>
												<th className="text-left px-3 py-2 font-semibold">Sensaciones</th>
											</tr>
										</thead>
										<tbody>
											{marcasVisible.map((m, i) => (
												<tr key={m.id_marca} className={`border-b border-white/15 ${i % 2 === 0 ? 'bg-oscuro/30' : ''} hover:bg-white/5 transition`}>
													<td className="px-3 py-2 font-medium text-white">{m.prueba}</td>
													<td className="px-3 py-2 text-gray-400">{m.categoria_nombre ?? '—'}</td>
													<td className="px-3 py-2 font-bold text-ianuarius">{m.marca}</td>
													<td className="px-3 py-2 text-gray-400">{m.tipo_competicion}</td>
													<td className="px-3 py-2 text-gray-400">{m.fecha}</td>
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

								{totalPaginas > 1 && (
									<div className="mt-3 flex items-center justify-between">
										<button
											onClick={() => setMarcaPage(p => Math.max(0, p - 1))}
											disabled={marcaPage === 0}
											className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
												<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
											</svg>
											Ant.
										</button>
										<span className="text-[10px] text-gray-500 uppercase tracking-widest">
											{marcaPage + 1} / {totalPaginas}
										</span>
										<button
											onClick={() => setMarcaPage(p => Math.min(totalPaginas - 1, p + 1))}
											disabled={marcaPage >= totalPaginas - 1}
											className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
										>
											Sig.
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
												<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
											</svg>
										</button>
									</div>
								)}
							</>
						)}
					</div>

					{/* documentos */}
					<div>
						<h3 className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-3">
							Documentos
						</h3>

						{/* tabs */}
						<div className="flex items-center gap-1 bg-oscuro/60 border border-white/20 rounded-lg p-1 mb-4 w-fit">
							{DOCS.map(d => (
								<button
									key={d.key}
									onClick={() => setTabDoc(d.key)}
									className={`px-3 py-1.5 label-caps rounded transition ${tabDoc === d.key ? 'bg-ianuarius text-white' : 'text-gray-400 hover:text-white'}`}
								>
									{d.label}
								</button>
							))}
						</div>

						{/* documento activo */}
						{!docActual?.src ? (
							<DocVacio />
						) : docActual.key === 'inscripcion' ? (
							<div className="rounded-xl overflow-hidden border border-white/15 bg-oscuro/30">
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
							<div className="rounded-xl overflow-hidden border border-white/15 bg-oscuro/30 flex flex-col items-center gap-2 p-3">
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
