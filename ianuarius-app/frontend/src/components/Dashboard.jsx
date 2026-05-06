import { useState, useEffect } from 'react';
import { API } from '../api';

// regex formato MM'SS"ms (ej: 00'49"15)
const REGEX_MARCA = /^\d{2}'\d{2}"\d{2}$/;
// marcas visibles en modo reducido
const MARCAS_RECIENTES = 3;
// marcas por pagina en modo completo
const MARCAS_POR_PAGINA = 10;

// vista interna de marcas y registro
export default function Dashboard() {
	const [temporada, setTemporada] = useState('shortTrack');

	// campos del formulario
	const [prueba, setPrueba] = useState('400m Lisos');
	const [tipoCompeticion, setTipoCompeticion] = useState('Control');
	const [marcaTiempo, setMarcaTiempo] = useState('');
	const [guardando, setGuardando] = useState(false);
	const [feedbackMsg, setFeedbackMsg] = useState(null);
	const [formatoError, setFormatoError] = useState(false);

	// categorias disponibles para el usuario
	const [categorias, setCategorias] = useState([]);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

	// listado marcas desde bd
	const [marcas, setMarcas] = useState([]);
	const [cargando, setCargando] = useState(true);

	// modo de visualizacion
	const [verTodas, setVerTodas] = useState(false);
	const [pagina, setPagina] = useState(1);

	// borrado
	const [confirmandoId, setConfirmandoId] = useState(null);
	const [eliminando, setEliminando] = useState(false);

	const cargarMarcas = () => {
		setCargando(true);
		fetch(`${API}/marcas`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') {
					setMarcas(data.marcas);
					setPagina(1); // reiniciar pagina al recargar

				}

			})
			.finally(() => setCargando(false));

	};

	useEffect(() => {
		cargarMarcas();
		fetch(`${API}/categorias`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setCategorias(data.categorias); });

	}, []);

	const etiquetaTemporada = (t) =>
		t === 'short_track' ? 'Short Track / Pista Cubierta' : 'Outdoor / Aire Libre';

	const formatearFecha = (fechaStr) => {
		const fecha = new Date(fechaStr + 'T00:00:00');
		return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

	};

	const handleMarcaBlur = () => {
		if (marcaTiempo && !REGEX_MARCA.test(marcaTiempo)) setFormatoError(true);
		else setFormatoError(false);

	};

	const handleGuardarMarca = (e) => {
		e.preventDefault();
		setFeedbackMsg(null);
		if (!REGEX_MARCA.test(marcaTiempo)) { setFormatoError(true); return; }
		setFormatoError(false);
		setGuardando(true);

		fetch(`${API}/marcas`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				prueba,
				temporada: temporada === 'shortTrack' ? 'short_track' : 'outdoor',
				tipo_competicion: tipoCompeticion,
				marca: marcaTiempo,
				id_categoria: categoriaSeleccionada
			})
		})
		.then(res => res.json())
		.then(data => {
			setGuardando(false);
			if (data.status === 'success') {
				setFeedbackMsg({ tipo: 'ok', texto: 'Marca guardada correctamente' });
				setMarcaTiempo('');
				cargarMarcas();

			} else {
				setFeedbackMsg({ tipo: 'error', texto: data.error || 'Error al guardar' });

			}

		})
		.catch(() => {
			setGuardando(false);
			setFeedbackMsg({ tipo: 'error', texto: 'Error de conexion' });

		});

	};

	const handleEliminarMarca = (id_marca) => {
		setEliminando(true);
		fetch(`${API}/marcas/${id_marca}`, { method: 'DELETE', credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				setEliminando(false);
				setConfirmandoId(null);
				if (data.status === 'success') cargarMarcas();

			})
			.catch(() => {
				setEliminando(false);
				setConfirmandoId(null);

			});

	};

	const toggleVerTodas = () => {
		setVerTodas(v => !v);
		setPagina(1);

	};

	// logica de que marcas mostrar
	const hayMas = marcas.length > MARCAS_RECIENTES;
	const usaPaginacion = verTodas && marcas.length > MARCAS_POR_PAGINA;
	const totalPaginas = Math.ceil(marcas.length / MARCAS_POR_PAGINA);

	const marcasVisibles = (() => {
		if (!verTodas) return marcas.slice(0, MARCAS_RECIENTES);
		if (usaPaginacion) return marcas.slice((pagina - 1) * MARCAS_POR_PAGINA, pagina * MARCAS_POR_PAGINA);
		return marcas;

	})();

	const selectClasses = "w-full bg-oscuro border border-white/10 p-4 md:p-3 rounded-lg text-sm focus:border-ianuarius outline-none transition appearance-none cursor-pointer";
	const labelClasses = "block text-xs lg:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2";

	return (
		<main className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

			{/* listado marcas desde bd */}
			<section className="lg:col-span-7">
				<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl h-full flex flex-col">
					<div className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
						<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Mis Marcas Recientes</h2>
						<span className="text-[10px] bg-ianuarius/20 text-ianuarius px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">Temporada 2026</span>
					</div>

					<div className="space-y-4 grow">
						{cargando && (
							<p className="text-gray-500 text-xs uppercase tracking-widest text-center py-6">Cargando marcas...</p>
						)}

						{!cargando && marcas.length === 0 && (
							<p className="text-gray-600 text-xs uppercase tracking-widest text-center py-6 border border-dashed border-gray-700 rounded-xl">
								Aun no hay marcas registradas
							</p>
						)}

						{!cargando && marcasVisibles.map((m) => (
							<div key={m.id_marca} className="group bg-oscuro/50 p-4 md:p-5 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-500">
								<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
									<div>
										<h3 className="text-white font-bold text-base md:text-lg">{m.prueba}</h3>
										<p className="text-xs text-gray-500 uppercase tracking-widest">{etiquetaTemporada(m.temporada)}</p>
										<p className="text-xs text-gray-600 mt-0.5">
											{m.tipo_competicion}{m.categoria_nombre ? ` · ${m.categoria_nombre}` : ''}
										</p>
									</div>
									<div className="sm:text-right">
										<p className="text-ianuarius text-3xl md:text-2xl tracking-tighter font-mono">{m.marca}</p>
										<p className="text-[10px] md:text-[9px] text-gray-600 uppercase">{formatearFecha(m.fecha)}</p>
									</div>
								</div>

								<div className="flex justify-end mt-3 pt-3 border-t border-white/5">
									<button
										onClick={() => setConfirmandoId(confirmandoId === m.id_marca ? null : m.id_marca)}
										className="text-gray-600 hover:text-ianuarius transition p-1"
										title="Eliminar marca"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
											<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
										</svg>
									</button>
								</div>

								{confirmandoId === m.id_marca && (
									<div className="mt-3 pt-3 border-t border-ianuarius/30 bg-gris rounded-xl p-4">
										<p className="text-xs text-gray-300 mb-4 leading-relaxed">
											¿Seguro que deseas eliminar esta marca? Esta acción no se puede deshacer.
										</p>
										<div className="flex gap-2">
											<button
												onClick={() => setConfirmandoId(null)}
												className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 text-gray-400 rounded hover:bg-white/5 transition"
											>
												Cancelar
											</button>
											<button
												onClick={() => handleEliminarMarca(m.id_marca)}
												disabled={eliminando}
												className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-ianuarius text-white rounded hover:bg-red-700 transition disabled:opacity-50"
											>
												{eliminando ? '...' : 'Eliminar'}
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					{/* controles inferiores */}
					{!cargando && (
						<div className="mt-6 shrink-0 space-y-3">

							{/* paginacion — solo cuando hay mas de 10 marcas en modo completo */}
							{usaPaginacion && (
								<div className="flex items-center justify-between border border-white/5 rounded-xl px-4 py-3">
									<button
										onClick={() => setPagina(p => Math.max(1, p - 1))}
										disabled={pagina === 1}
										className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
											<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
										</svg>
										Mas recientes
									</button>

									<span className="text-[10px] text-gray-600 font-mono">
										{pagina} / {totalPaginas}
									</span>

									<button
										onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
										disabled={pagina === totalPaginas}
										className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
									>
										Mas antiguas
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
											<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
										</svg>
									</button>
								</div>
							)}

							{/* boton ver mas / ver menos */}
							{hayMas && (
								<button
									onClick={toggleVerTodas}
									className="w-full py-3 border border-dashed border-gray-700 text-gray-500 text-xs font-bold uppercase tracking-[0.3em] hover:text-white hover:border-white transition duration-300"
								>
									{verTodas
										? `Mostrar solo las últimas ${MARCAS_RECIENTES}`
										: `Ver todas las marcas (${marcas.length})`}
								</button>
							)}
						</div>
					)}
				</div>
			</section>

			{/* formulario nueva marca — self-start en desktop: no crece con el historial */}
			<aside className="lg:col-span-5 lg:self-start">
				<div className="bg-gris p-6 md:p-8 rounded-2xl border-t-8 border-ianuarius shadow-2xl">
					<div className="shrink-0">
						<h2 className="text-xl md:text-2xl font-extrabold mb-2 tracking-tight">Nueva Marca</h2>
						<p className="text-gray-500 text-xs mb-6 md:mb-8 uppercase tracking-widest font-semibold">Guardar tiempo en bd</p>

						{feedbackMsg && (
							<div className={`mb-5 p-3 rounded-lg text-xs font-bold uppercase tracking-widest text-center ${feedbackMsg.tipo === 'ok' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-red-500/10 border border-red-500 text-red-400'}`}>
								{feedbackMsg.texto}
							</div>
						)}
					</div>

					<form onSubmit={handleGuardarMarca} className="space-y-6">

						<div>
							<label className={labelClasses}>Prueba</label>
							<select value={prueba} onChange={(e) => setPrueba(e.target.value)} className={selectClasses}>
								<option>400m Lisos</option>
								<option>400m Vallas</option>
								<option>200m Lisos</option>
							</select>
						</div>

						<div>
							<label className={labelClasses}>Tipo de Competicion</label>
							<select value={tipoCompeticion} onChange={(e) => setTipoCompeticion(e.target.value)} className={selectClasses}>
								<option>Nacional</option>
								<option>Autonomico CyL</option>
								<option>Provincial</option>
								<option>Escolar</option>
								<option>Control</option>
							</select>
						</div>

						<div>
							<label className={labelClasses}>Categoría</label>
							<select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className={selectClasses}>
								<option value="">Sin especificar</option>
								{categorias.map(c => (
									<option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
								))}
							</select>
						</div>

						<div>
							<label className={labelClasses}>Temporada</label>
							<div className="grid grid-cols-2 gap-4">
								<button type="button" onClick={() => setTemporada('shortTrack')}
									className={`py-3 md:py-2 text-xs lg:text-[10px] font-bold rounded uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${temporada === 'shortTrack' ? 'bg-ianuarius border border-transparent text-white shadow-[0_0_15px_rgba(254,0,0,0.4)]' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
									Short Track
								</button>
								<button type="button" onClick={() => setTemporada('outdoor')}
									className={`py-3 md:py-2 text-xs lg:text-[10px] font-bold rounded uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${temporada === 'outdoor' ? 'bg-ianuarius border border-transparent text-white shadow-[0_0_15px_rgba(254,0,0,0.4)]' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
									Outdoor
								</button>
							</div>
						</div>

						<div>
							<label className={labelClasses}>Marca Final (MM'SS"ms)</label>
							<input
								type="text"
								placeholder={`00'00"00`}
								value={marcaTiempo}
								onChange={(e) => { setMarcaTiempo(e.target.value); setFormatoError(false); }}
								onBlur={handleMarcaBlur}
								required
								className={`w-full bg-oscuro border p-5 md:p-4 rounded-lg text-2xl text-ianuarius outline-none transition font-mono ${formatoError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-ianuarius'}`}
							/>
							{formatoError && (
								<p className="text-red-400 text-[10px] mt-1.5 uppercase tracking-wider">
									Formato incorrecto — usa MM'SS"ms (ej: 00'49"15)
								</p>
							)}
						</div>

						<button
							type="submit"
							disabled={guardando}
							className="w-full bg-white text-oscuro font-black py-5 md:py-4 rounded-xl text-sm lg:text-xs uppercase tracking-[0.3em] hover:bg-ianuarius hover:text-white transition duration-500 shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(254,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{guardando ? 'Guardando...' : 'Guardar Registro'}
						</button>

					</form>
				</div>
			</aside>

		</main>
	);

}
