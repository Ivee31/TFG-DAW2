import { useState, useEffect, useRef } from 'react';
import { API } from '../api';
import PerfilAtleta from './PerfilAtleta';
import SelectorOpciones from './SelectorOpciones';
import CustomSelect from './CustomSelect';

const CATEGORIA_ORDEN = [
	'Sub-10','Sub-12','Sub-14','Sub-16','Sub-18','Sub-20','Sub-23',
	'Absoluta',
	'M35','F35','M40','F40','M45','F45','M50','F50','M55','F55','M60','F60','M65','F65',
];

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

function UsuarioAvatar({ fotoPerfil, fotoCarnet, nombre, apellidos }) {
	const src = fotoCarnet || fotoPerfil || null;
	const initials = ((nombre?.[0] || '') + (apellidos?.[0] || '')).toUpperCase();
	return src ? (
		<img src={src} alt={`${nombre} ${apellidos}`} className="w-10 h-10 rounded-full object-cover shrink-0" />
	) : (
		<div className="w-10 h-10 rounded-full bg-ianuarius/15 border border-ianuarius/25 flex items-center justify-center shrink-0">
			<span className="text-ianuarius text-xs font-black">{initials}</span>
		</div>
	);
}

export default function AdminPanel() {
	const [tab, setTab] = useState('atletas');
	const [pendientes, setPendientes] = useState([]);
	const [atletas, setAtletas] = useState([]);
	const [entrenadores, setEntrenadores] = useState([]);
	const [cargandoP, setCargandoP] = useState(true);
	const [cargandoA, setCargandoA] = useState(true);
	const [cargandoE, setCargandoE] = useState(true);
	const [activando, setActivando] = useState(null);
	const [atletaSeleccionado, setAtletaSeleccionado] = useState(null);
	const [entrenadorSeleccionado, setEntrenadorSeleccionado] = useState(null);
	const plantillaRef = useRef(null);
	const [plantillaInfo, setPlantillaInfo]   = useState(null);
	const [subiendoP, setSubiendoP]           = useState(false);
	const [plantillaMsg, setPlantillaMsg]     = useState('');

	const [busquedaA, setBusquedaA]               = useState('');
	const [filtroGeneroA, setFiltroGeneroA]       = useState('todos');
	const [filtroCategoriaA, setFiltroCategoriaA] = useState('');
	const [filtroDocsA, setFiltroDocsA]           = useState(false);
	const [busquedaE, setBusquedaE]               = useState('');

	const cargarPendientes = () => {
		setCargandoP(true);
		fetch(`${API}/admin/pendientes`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setPendientes(data.pendientes); })
			.finally(() => setCargandoP(false));

	};

	useEffect(() => {
		cargarPendientes();
		fetch(`${API}/admin/plantilla-inscripcion`, { credentials: 'include' })
			.then(r => r.json())
			.then(d => { if (d.status === 'success') setPlantillaInfo(true); })
			.catch(() => {});
		fetch(`${API}/usuarios/atletas`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setAtletas(data.atletas); })
			.finally(() => setCargandoA(false));

		fetch(`${API}/usuarios/entrenadores`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setEntrenadores(data.entrenadores); })
			.finally(() => setCargandoE(false));

	}, []);

	const handleActivar = (id) => {
		setActivando(id);
		fetch(`${API}/admin/activar/${id}`, { method: 'POST', credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') cargarPendientes();

			})
			.finally(() => setActivando(null));

	};

	const handlePlantilla = async (file) => {
		if (file.type !== 'application/pdf') { setPlantillaMsg('Solo se aceptan archivos PDF'); return; }
		setSubiendoP(true);
		setPlantillaMsg('');
		try {
			const reader = new FileReader();
			const base64 = await new Promise((res, rej) => { reader.onload = () => res(reader.result); reader.onerror = rej; reader.readAsDataURL(file); });
			const resp = await fetch(`${API}/admin/plantilla-inscripcion`, {
				method: 'PUT', credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pdf: base64 })
			});
			const d = await resp.json();
			if (d.status === 'success') { setPlantillaInfo(true); setPlantillaMsg('Plantilla actualizada'); }
			else setPlantillaMsg(d.error || 'Error al subir');
		} catch { setPlantillaMsg('Error de conexión'); }
		setSubiendoP(false);
	};

	const handleTogglePago = async (id, pagadoActual) => {
		const nuevo = !pagadoActual;
		setAtletas(prev => prev.map(a => a.id_usuario === id ? { ...a, estado_pago: nuevo ? 'pagado' : 'pendiente' } : a));
		try {
			await fetch(`${API}/admin/inscripcion/${id}`, {
				method: 'PUT', credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pagado: nuevo })
			});
		} catch {
			setAtletas(prev => prev.map(a => a.id_usuario === id ? { ...a, estado_pago: pagadoActual ? 'pagado' : 'pendiente' } : a));
		}
	};

	if (atletaSeleccionado) {
		return <PerfilAtleta atletaId={atletaSeleccionado} onVolver={() => setAtletaSeleccionado(null)} />;
	}

	if (entrenadorSeleccionado) {
		return <PerfilAtleta atletaId={entrenadorSeleccionado} onVolver={() => setEntrenadorSeleccionado(null)} />;
	}

	const categoriasDisponibles = [...new Set(atletas.map(a => calcularCategoria(a.fecha_nacimiento, a.genero)))]
		.sort((a, b) => CATEGORIA_ORDEN.indexOf(a) - CATEGORIA_ORDEN.indexOf(b));

	const docsIncompletas = (a) => !parseInt(a.tiene_dni) || !parseInt(a.tiene_carnet) || !parseInt(a.tiene_inscripcion);

	const atletasFiltrados = atletas.filter(a => {
		const q = busquedaA.toLowerCase().trim();
		const matchBusqueda = !q ||
			`${a.nombre} ${a.apellidos}`.toLowerCase().includes(q) ||
			a.email.toLowerCase().includes(q);
		const matchGenero    = filtroGeneroA === 'todos' || a.genero === filtroGeneroA;
		const matchCategoria = !filtroCategoriaA || calcularCategoria(a.fecha_nacimiento, a.genero) === filtroCategoriaA;
		const matchDocs      = !filtroDocsA || docsIncompletas(a);
		return matchBusqueda && matchGenero && matchCategoria && matchDocs;
	});

	const entrenadoresFiltrados = entrenadores.filter(e => {
		const q = busquedaE.toLowerCase().trim();
		return !q ||
			`${e.nombre} ${e.apellidos}`.toLowerCase().includes(q) ||
			e.email.toLowerCase().includes(q);
	});

	const hayFiltrosA = busquedaA.trim() || filtroGeneroA !== 'todos' || filtroCategoriaA || filtroDocsA;

	return (
		<main className="space-y-8">

			{/* cuentas pendientes de activacion */}
			<section>
				<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-yellow-500/20 shadow-2xl">
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Cuentas Pendientes</h2>
							<p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">
								Entrenadores en espera de activación
							</p>
						</div>
						{!cargandoP && pendientes.length > 0 && (
							<span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
								{pendientes.length} pendiente{pendientes.length !== 1 ? 's' : ''}
							</span>
						)}
					</div>

					{cargandoP && (
						<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-6">
							Cargando...
						</p>
					)}

					{!cargandoP && pendientes.length === 0 && (
						<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-6 border border-dashed border-gray-700 rounded-xl">
							No hay cuentas pendientes de activación
						</p>
					)}

					{!cargandoP && pendientes.length > 0 && (
						<div className="space-y-3">
							{pendientes.map(p => (
								<div key={p.id_usuario}
									className="bg-oscuro/50 p-4 rounded-xl border border-yellow-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div>
										<p className="text-white font-bold text-sm">
											{p.nombre} {p.apellidos}
										</p>
										<p className="text-gray-400 text-[10px] mt-0.5">{p.email}</p>
									</div>
									<button
										onClick={() => handleActivar(p.id_usuario)}
										disabled={activando === p.id_usuario}
										className="shrink-0 px-5 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{activando === p.id_usuario ? 'Activando...' : 'Activar cuenta'}
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</section>

			{/* listado atletas / entrenadores */}
			<section>
				<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
						<div>
							<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Miembros del Club</h2>
							<p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">
								{tab === 'atletas'
									? (cargandoA ? '...' : hayFiltrosA ? `${atletasFiltrados.length} de ${atletas.length} atletas` : `${atletas.length} atletas activos`)
									: (cargandoE ? '...' : busquedaE.trim() ? `${entrenadoresFiltrados.length} de ${entrenadores.length} entrenadores` : `${entrenadores.length} entrenadores activos`)}
							</p>
							{tab === 'atletas' && !cargandoA && atletas.filter(a => a.estado_pago !== 'pagado').length > 0 && (
								<p className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest mt-1">
									⚠ {atletas.filter(a => a.estado_pago !== 'pagado').length} pago{atletas.filter(a => a.estado_pago !== 'pagado').length !== 1 ? 's' : ''} pendiente{atletas.filter(a => a.estado_pago !== 'pagado').length !== 1 ? 's' : ''}
								</p>
							)}
						</div>
						<SelectorOpciones
							nombre="admin-tab"
							valor={tab}
							onChange={setTab}
							opciones={[
								{ valor: 'atletas',      etiqueta: 'Atletas'      },
								{ valor: 'entrenadores', etiqueta: 'Entrenadores' },
							]}
						/>
					</div>

					{/* tab atletas */}
					{tab === 'atletas' && (
						<>
							{!cargandoA && atletas.length > 0 && (
								<div className="flex flex-col sm:flex-row gap-3 mb-6">
									<div className="relative flex-1">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none">
											<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
										</svg>
										<input
											type="text"
											value={busquedaA}
											onChange={e => setBusquedaA(e.target.value)}
											placeholder="Buscar por nombre o email..."
											className="w-full bg-oscuro text-white text-sm font-semibold border-2 border-[#4B5563] shadow-[3px_3px_0_#374151] rounded pl-9 pr-4 py-2.5 neo-input outline-none placeholder-gray-600"
										/>
									</div>

									<SelectorOpciones
										nombre="filtro-genero-admin"
										valor={filtroGeneroA}
										onChange={setFiltroGeneroA}
										opciones={[
											{ valor: 'todos', etiqueta: 'Todos' },
											{ valor: 'M',     etiqueta: 'Masc'  },
											{ valor: 'F',     etiqueta: 'Fem'   },
										]}
									/>

									{categoriasDisponibles.length > 1 && (
										<CustomSelect
											value={filtroCategoriaA}
											onChange={e => setFiltroCategoriaA(e.target.value)}
											containerClassName="shrink-0"
											className="bg-oscuro border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius cursor-pointer"
											options={[
												{ value: '', label: 'Todas las categorías' },
												...categoriasDisponibles.map(c => ({ value: c, label: c })),
											]}
										/>
									)}

									<button
										onClick={() => setFiltroDocsA(v => !v)}
										className={`shrink-0 px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition ${
											filtroDocsA
												? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
												: 'bg-oscuro border-white/10 text-gray-400 hover:text-white hover:border-white/30'
										}`}
									>
										Docs pendientes
									</button>
								</div>
							)}

							{cargandoA && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10">
									Cargando atletas...
								</p>
							)}

							{!cargandoA && atletas.length === 0 && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
									No hay atletas registrados
								</p>
							)}

							{!cargandoA && atletas.length > 0 && atletasFiltrados.length === 0 && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
									Sin resultados para los filtros aplicados
								</p>
							)}

							{!cargandoA && atletasFiltrados.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
									{atletasFiltrados.map(a => (
										<div key={a.id_usuario}
											onClick={() => setAtletaSeleccionado(a.id_usuario)}
											className={`bg-oscuro/50 p-4 rounded-xl border transition duration-300 cursor-pointer hover:border-ianuarius/50 ${a.estado_pago !== 'pagado' ? 'border-yellow-500/20' : 'border-transparent'}`}>
											<div className="flex items-start gap-3">
												<UsuarioAvatar fotoPerfil={a.foto_perfil} fotoCarnet={a.foto_carnet} nombre={a.nombre} apellidos={a.apellidos} />
												<div className="flex-1 min-w-0">
													<div className="flex justify-between items-start gap-2">
														<div className="min-w-0">
															<h3 className="text-white font-bold text-sm truncate">
																{a.apellidos}, {a.nombre}
															</h3>
															<p className="text-gray-400 text-[10px] truncate mt-0.5">{a.email}</p>
														</div>
														<span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-ianuarius/15 text-ianuarius px-2 py-0.5 rounded-full">
															{calcularCategoria(a.fecha_nacimiento, a.genero)}
														</span>
													</div>
													<div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
														<span className="text-[10px] text-gray-400 uppercase tracking-widest">
															{a.genero === 'M' ? 'Masculino' : 'Femenino'}
														</span>
														<div className="flex items-center gap-2">
															{docsIncompletas(a) && (
																<span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-1.5 py-0.5 rounded">
																	Docs
																</span>
															)}
															<span className="text-[10px] font-bold text-gray-400">
																{a.total_marcas} {parseInt(a.total_marcas) === 1 ? 'marca' : 'marcas'}
															</span>
														</div>
													</div>
													<div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center" onClick={e => e.stopPropagation()}>
														<span className={`text-[9px] font-bold uppercase tracking-widest ${a.estado_pago === 'pagado' ? 'text-green-500' : 'text-yellow-400'}`}>
															{a.estado_pago === 'pagado' ? '✓ Pagado' : '⚠ Pago pendiente'}
														</span>
														<button
															onClick={() => handleTogglePago(a.id_usuario, a.estado_pago === 'pagado')}
															className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition bg-ianuarius/10 text-ianuarius hover:bg-ianuarius/20"
														>
															{a.estado_pago === 'pagado' ? 'Marcar pendiente' : 'Marcar pagado'}
														</button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}

					{/* tab entrenadores */}
					{tab === 'entrenadores' && (
						<>
							{!cargandoE && entrenadores.length > 0 && (
								<div className="mb-6">
									<div className="relative">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none">
											<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
										</svg>
										<input
											type="text"
											value={busquedaE}
											onChange={e => setBusquedaE(e.target.value)}
											placeholder="Buscar por nombre o email..."
											className="w-full bg-oscuro text-white text-sm font-semibold border-2 border-[#4B5563] shadow-[3px_3px_0_#374151] rounded pl-9 pr-4 py-2.5 neo-input outline-none placeholder-gray-600"
										/>
									</div>
								</div>
							)}

							{cargandoE && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10">
									Cargando entrenadores...
								</p>
							)}

							{!cargandoE && entrenadores.length === 0 && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
									No hay entrenadores activos
								</p>
							)}

							{!cargandoE && entrenadores.length > 0 && entrenadoresFiltrados.length === 0 && (
								<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
									Sin resultados para la búsqueda
								</p>
							)}

							{!cargandoE && entrenadoresFiltrados.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
									{entrenadoresFiltrados.map(e => (
										<div
											key={e.id_usuario}
											onClick={() => setEntrenadorSeleccionado(e.id_usuario)}
											className="bg-oscuro/50 p-4 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-300 cursor-pointer"
										>
											<div className="flex items-start gap-3">
												<UsuarioAvatar fotoPerfil={e.foto_perfil} fotoCarnet={e.foto_carnet} nombre={e.nombre} apellidos={e.apellidos} />

												<div className="flex-1 min-w-0">
													<div className="flex justify-between items-start gap-2">
														<div className="min-w-0">
															<h3 className="text-white font-bold text-sm truncate">
																{e.apellidos}, {e.nombre}
															</h3>
															<p className="text-gray-400 text-[10px] truncate mt-0.5">{e.email}</p>
														</div>

														<span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-ianuarius/15 text-ianuarius px-2 py-0.5 rounded-full">
															{calcularCategoria(e.fecha_nacimiento, e.genero)}
														</span>
													</div>

													<div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
														<span className="text-[10px] text-gray-400 uppercase tracking-widest">
															{e.genero === 'M' ? 'Masculino' : 'Femenino'}
														</span>
														<span className="text-[9px] font-bold text-ianuarius/60 uppercase tracking-widest">
															Entrenador
														</span>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</>
					)}
				</div>
			</section>

			{/* plantilla inscripcion */}
			<section>
				<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
					<div className="flex justify-between items-center mb-4">
						<div>
							<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Plantilla de inscripción</h2>
							<p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">
								PDF oficial que los atletas descargarán para inscribirse
							</p>
						</div>
						{plantillaInfo && (
							<span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
								Subida
							</span>
						)}
					</div>
					{plantillaMsg && (
						<p className={`text-xs mb-3 text-center ${plantillaMsg === 'Plantilla actualizada' ? 'text-green-400' : 'text-red-400'}`}>{plantillaMsg}</p>
					)}
					<input ref={plantillaRef} type="file" accept="application/pdf" className="hidden" onChange={e => { if (e.target.files[0]) handlePlantilla(e.target.files[0]); e.target.value = ''; }} />
					<button
						disabled={subiendoP}
						onClick={() => plantillaRef.current?.click()}
						className="flex items-center gap-2 px-5 py-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded hover:border-white/40 hover:bg-white/5 transition disabled:opacity-40"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
						</svg>
						{subiendoP ? 'Subiendo...' : plantillaInfo ? 'Reemplazar plantilla' : 'Subir plantilla PDF'}
					</button>
				</div>
			</section>

		</main>
	);

}
