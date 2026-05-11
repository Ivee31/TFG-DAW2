import { useState, useEffect, useRef } from 'react';
import { API } from '../api';

const pruebaKey = (p) => `${p.id_prueba}_${p.especificaciones ?? ''}`;

const GRUPO_ORDEN = [
	'Velocidad Corta', 'Velocidad Larga', 'Vallas',
	'Medio Fondo', 'Fondo', 'Larga Distancia', 'Obstaculos',
	'Salto', 'Lanzamiento', 'Marcha',
];

const MAP_TIPO = {
	nacional:   'Nacional',
	autonomico: 'Autonómico CyL',
	provincial: 'Provincial',
	escolares:  'Escolar',
	control:    'Control',
};

const MAP_TIPO_BACKEND = {
	nacional:   'Nacional',
	autonomico: 'Autonomico CyL',
	provincial: 'Provincial',
	escolares:  'Escolar',
	control:    'Control',
};

const etiquetaTipoPista = (tipo_pista) =>
	tipo_pista === 'pista cubierta' ? 'Short Track / Pista Cubierta' : 'Outdoor / Aire Libre';

const formatFechaEvento = (fecha_hora) => {
	const [fecha] = fecha_hora.split(' ');
	return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

function PruebaSelect({ pruebas, value, onChange }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const ref = useRef(null);

	useEffect(() => {
		const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	const selected = pruebas.find(p => pruebaKey(p) === value);

	const grupos = {};
	pruebas
		.filter(p => p.nombre_prueba.toLowerCase().includes(query.toLowerCase()))
		.forEach(p => {
			if (!grupos[p.tipo]) grupos[p.tipo] = [];
			grupos[p.tipo].push(p);
		});

	const gruposOrdenados = Object.entries(grupos).sort(([a], [b]) => {
		const ai = GRUPO_ORDEN.indexOf(a);
		const bi = GRUPO_ORDEN.indexOf(b);
		return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
	});

	return (
		<div ref={ref} className="relative">
			<div onClick={() => setOpen(v => !v)} className="w-full bg-oscuro border border-white/10 p-4 md:p-3 rounded-lg text-sm outline-none transition cursor-pointer flex items-center justify-between">
				<span className={selected ? 'text-white' : 'text-gray-500'}>
					{selected
						? selected.nombre_prueba + (selected.especificaciones ? ` · ${selected.especificaciones}` : '')
						: 'Seleccionar prueba'}
				</span>

				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
					<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
				</svg>
			</div>

			{open && (
				<div className="absolute z-50 w-full mt-1 bg-oscuro border border-white/10 rounded-lg shadow-2xl overflow-hidden">
					<div className="p-2 border-b border-white/5">
						<input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar prueba..." autoFocus className="w-full bg-gris text-white text-sm p-2 rounded outline-none placeholder-gray-600 focus:ring-1 ring-ianuarius" />
					</div>

					<div className="max-h-96 overflow-y-auto">
						{gruposOrdenados.map(([tipo, items]) => (
							<div key={tipo}>
								<p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ianuarius bg-gris/30 sticky top-0">{tipo}</p>

								{items.map(p => (
									<div key={pruebaKey(p)} onClick={() => { onChange(pruebaKey(p)); setOpen(false); setQuery(''); }} className={`px-3 py-2.5 text-sm cursor-pointer transition hover:bg-white/5 flex items-center justify-between ${value === pruebaKey(p) ? 'text-ianuarius' : 'text-gray-300'}`}>
										<span>{p.nombre_prueba}</span>

										{p.especificaciones && (
											<span className="text-gray-600 text-xs">{p.especificaciones}</span>
										)}
									</div>
								))}
							</div>
						))}

						{gruposOrdenados.length === 0 && (
							<p className="text-gray-600 text-xs text-center py-4 uppercase tracking-widest">Sin resultados</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

const REGEX_MARCA = /^\d{2}'\d{2}"\d{2}$/;

const formatMarcaTiempo = (raw) => {
	const digits = raw.replace(/\D/g, '').slice(0, 6);
	let result = digits.slice(0, 2);
	if (digits.length > 2) result += "'" + digits.slice(2, 4);
	if (digits.length > 4) result += '"' + digits.slice(4, 6);
	return result;
};

const SENSACIONES = ['😩', '😟', '😐', '😊', '🤩'];

const MARCAS_RECIENTES = 3;
const MARCAS_POR_PAGINA = 10;

export default function Dashboard() {
	// campos formulario nueva marca
	const [prueba, setPrueba]                       = useState('');
	const [pruebas, setPruebas]                     = useState([]);
	const [marcaTiempo, setMarcaTiempo]             = useState('');
	const [sensacionesValor, setSensacionesValor]   = useState(null);
	const [sensacionesNotas, setSensacionesNotas]   = useState('');
	const [guardando, setGuardando]                 = useState(false);
	const [feedbackMsg, setFeedbackMsg]             = useState(null);
	const [formatoError, setFormatoError]           = useState(false);

	// competiciones del calendario (para vincular la marca)
	const [competiciones, setCompeticiones]             = useState([]);
	const [cargandoEventos, setCargandoEventos]         = useState(true);
	const [eventoSeleccionado, setEventoSeleccionado]   = useState(null);

	// categorias
	const [categorias, setCategorias]                   = useState([]);
	const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');

	// listado marcas
	const [marcas, setMarcas]       = useState([]);
	const [cargando, setCargando]   = useState(true);

	// visualizacion
	const [verTodas, setVerTodas]   = useState(false);
	const [pagina, setPagina]       = useState(1);

	// borrado
	const [confirmandoId, setConfirmandoId] = useState(null);
	const [eliminando, setEliminando]       = useState(false);

	// edicion
	const [editandoId, setEditandoId]                   = useState(null);
	const [editPrueba, setEditPrueba]                   = useState('');
	const [editTemporada, setEditTemporada]             = useState('outdoor');
	const [editTipo, setEditTipo]                       = useState('Control');
	const [editMarca, setEditMarca]                     = useState('');
	const [editCategoria, setEditCategoria]             = useState('');
	const [editSensacionesValor, setEditSensacionesValor] = useState(null);
	const [editSensacionesNotas, setEditSensacionesNotas] = useState('');
	const [editFormatoError, setEditFormatoError]       = useState(false);
	const [guardandoEdicion, setGuardandoEdicion]       = useState(false);
	const [editEvento, setEditEvento]                   = useState(null);

	const cargarMarcas = () => {
		setCargando(true);
		fetch(`${API}/marcas`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') {
					setMarcas(data.marcas);
					setPagina(1);
				}
			})
			.finally(() => setCargando(false));
	};

	useEffect(() => {
		cargarMarcas();

		fetch(`${API}/categorias`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') {
					setCategorias(data.categorias);
					if (data.categorias.length > 0) setCategoriaSeleccionada(data.categorias[0].id_categoria);
				}
			});

		fetch(`${API}/pruebas`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') {
					setPruebas(data.pruebas);
					if (data.pruebas.length > 0) setPrueba(pruebaKey(data.pruebas[0]));
				}
			});

		fetch(`${API}/eventos/mis-competiciones`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setCompeticiones(data.eventos); })
			.finally(() => setCargandoEventos(false));
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
		if (!eventoSeleccionado) {
			setFeedbackMsg({ tipo: 'error', texto: 'Selecciona una competición del calendario' });
			return;
		}
		if (!REGEX_MARCA.test(marcaTiempo)) { setFormatoError(true); return; }
		setFormatoError(false);
		setGuardando(true);

		const selectedPrueba = pruebas.find(p => pruebaKey(p) === prueba);
		fetch(`${API}/marcas`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				prueba: selectedPrueba?.nombre_prueba ?? prueba,
				id_evento: eventoSeleccionado.id_evento,
				id_categoria: categoriaSeleccionada,
				marca: marcaTiempo,
				sensaciones_valor: sensacionesValor,
				sensaciones_notas: sensacionesNotas
			})
		})
		.then(res => res.json())
		.then(data => {
			setGuardando(false);
			if (data.status === 'success') {
				setFeedbackMsg({ tipo: 'ok', texto: 'Marca guardada correctamente' });
				setMarcaTiempo('');
				setSensacionesValor(null);
				setSensacionesNotas('');
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

	const handleAbrirEditar = (m) => {
		if (editandoId === m.id_marca) { setEditandoId(null); return; }
		const match = pruebas.find(p => p.nombre_prueba === m.prueba);
		setEditPrueba(match ? pruebaKey(match) : '');
		setEditTemporada(m.temporada === 'short_track' ? 'shortTrack' : 'outdoor');
		setEditTipo(m.tipo_competicion);
		setEditMarca(m.marca);
		setEditCategoria(m.id_categoria ?? '');
		setEditSensacionesValor(m.sensaciones_valor ? parseInt(m.sensaciones_valor) : null);
		setEditSensacionesNotas(m.sensaciones_notas ?? '');
		setEditFormatoError(false);
		setConfirmandoId(null);
		const eventoMarca = m.id_evento
			? (competiciones.find(e => e.id_evento === parseInt(m.id_evento)) ?? null)
			: null;
		setEditEvento(eventoMarca);
		setEditandoId(m.id_marca);
	};

	const handleGuardarEdicion = (id_marca) => {
		if (!REGEX_MARCA.test(editMarca)) { setEditFormatoError(true); return; }
		setEditFormatoError(false);
		setGuardandoEdicion(true);
		const sel = pruebas.find(p => pruebaKey(p) === editPrueba);
		fetch(`${API}/marcas/${id_marca}`, {
			method: 'PUT',
			credentials: 'include',
			body: JSON.stringify({
				prueba: sel?.nombre_prueba ?? editPrueba,
				temporada: editEvento
					? (editEvento.tipo_pista === 'pista cubierta' ? 'short_track' : 'outdoor')
					: (editTemporada === 'shortTrack' ? 'short_track' : 'outdoor'),
				tipo_competicion: editEvento
					? (MAP_TIPO_BACKEND[editEvento.tipo_evento] ?? 'Control')
					: editTipo,
				marca: editMarca,
				id_categoria: editCategoria,
				id_evento: editEvento?.id_evento ?? null,
				sensaciones_valor: editSensacionesValor,
				sensaciones_notas: editSensacionesNotas
			})
		})
		.then(res => res.json())
		.then(data => {
			setGuardandoEdicion(false);
			if (data.status === 'success') { setEditandoId(null); cargarMarcas(); }
		})
		.catch(() => setGuardandoEdicion(false));
	};

	const toggleVerTodas = () => {
		setVerTodas(v => !v);
		setPagina(1);
	};

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
		<main className="space-y-6">

			<div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 flex items-start gap-3">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5">
					<path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
				</svg>
				<p className="text-xs text-gray-400 leading-relaxed">
					Por favor, introduce solo marcas reales y verídicas. Este apartado existe para ayudar a l@s entrenador@s a consultar el rendimiento de sus atletas. Si se introducen marcas incorrectas y un entrenador las usa para inscribir a alguien en una competición, las posibles consecuencias — como quedar excluido de la misma — serán responsabilidad del atleta que haya introducido la información errónea.
				</p>
			</div>

		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

			{/* listado marcas */}
			<section className="lg:col-span-7">
				<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl h-full flex flex-col">
					<div className="flex justify-between items-center mb-6 md:mb-8 shrink-0">
						<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Mis Marcas Recientes</h2>
						<span className="text-[10px] bg-ianuarius/20 text-ianuarius px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">Temporada 2026</span>
					</div>

					<div className="space-y-4 grow">
						{cargando && (
							<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-6">Cargando marcas...</p>
						)}

						{!cargando && marcas.length === 0 && (
							<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-6 border border-dashed border-gray-700 rounded-xl">
								Aun no hay marcas registradas
							</p>
						)}

						{!cargando && marcasVisibles.map((m) => (
							<div key={m.id_marca} className="group bg-oscuro/50 p-4 md:p-5 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-500">
								<div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
									<div>
										<h3 className="text-white font-bold text-base md:text-lg">{m.prueba}</h3>
										<p className="text-xs text-gray-400 uppercase tracking-widest">{etiquetaTemporada(m.temporada)}</p>
										<p className="text-xs text-gray-400 mt-0.5">
											{m.titulo_evento ?? m.tipo_competicion}{m.categoria_nombre ? ` · ${m.categoria_nombre}` : ''}
										</p>
									</div>
									<div className="sm:text-right">
										<p className="text-ianuarius text-3xl md:text-2xl tracking-tighter font-mono">{m.marca}</p>
										<p className="text-[10px] md:text-[9px] text-gray-400 uppercase">{formatearFecha(m.fecha)}</p>
									</div>
								</div>

								{m.sensaciones_valor && (
									<div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
										<span className="text-lg leading-none">{SENSACIONES[m.sensaciones_valor - 1]}</span>
										{m.sensaciones_notas && (
											<p className="text-xs text-gray-400 italic truncate">{m.sensaciones_notas}</p>
										)}
									</div>
								)}

								<div className="flex justify-between mt-3 pt-3 border-t border-white/5">
									<button
										onClick={() => handleAbrirEditar(m)}
										className="text-gray-600 hover:text-white transition p-1"
										title="Editar marca"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
											<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
										</svg>
									</button>

									<button
										onClick={() => { setConfirmandoId(confirmandoId === m.id_marca ? null : m.id_marca); setEditandoId(null); }}
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

								{editandoId === m.id_marca && (
									<div className="mt-3 pt-3 border-t border-white/20 bg-gris rounded-xl p-4 space-y-4">

										<div>
											<label className={labelClasses}>Competición <span className="normal-case text-gray-600 font-normal">(opcional)</span></label>
											<select
												value={editEvento?.id_evento ?? ''}
												onChange={(e) => {
													const id = parseInt(e.target.value);
													setEditEvento(id ? (competiciones.find(c => c.id_evento === id) ?? null) : null);
												}}
												className={selectClasses}
											>
												<option value="">Sin competición vinculada</option>
												{competiciones.map(c => (
													<option key={c.id_evento} value={c.id_evento}>
														{c.titulo} — {formatFechaEvento(c.fecha_hora)}
													</option>
												))}
											</select>
											{editEvento && (
												<p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider">
													{MAP_TIPO[editEvento.tipo_evento]} · {etiquetaTipoPista(editEvento.tipo_pista)}
												</p>
											)}
										</div>

										<div>
											<label className={labelClasses}>Prueba</label>
											<PruebaSelect pruebas={pruebas} value={editPrueba} onChange={setEditPrueba} />
										</div>

										{!editEvento && (
											<>
												<div>
													<label className={labelClasses}>Tipo de Competicion</label>
													<select value={editTipo} onChange={(e) => setEditTipo(e.target.value)} className={selectClasses}>
														<option>Nacional</option>
														<option>Autonomico CyL</option>
														<option>Provincial</option>
														<option>Escolar</option>
														<option>Control</option>
													</select>
												</div>

												<div>
													<label className={labelClasses}>Temporada</label>
													<div className="grid grid-cols-2 gap-3">
														<button type="button" onClick={() => setEditTemporada('shortTrack')} className={`py-2 text-[10px] font-bold rounded uppercase tracking-widest transition ${editTemporada === 'shortTrack' ? 'bg-ianuarius text-white' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
															Short Track
														</button>
														<button type="button" onClick={() => setEditTemporada('outdoor')} className={`py-2 text-[10px] font-bold rounded uppercase tracking-widest transition ${editTemporada === 'outdoor' ? 'bg-ianuarius text-white' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
															Outdoor
														</button>
													</div>
												</div>
											</>
										)}

										<div>
											<label className={labelClasses}>Categoría</label>
											<select value={editCategoria} onChange={(e) => setEditCategoria(e.target.value)} className={selectClasses}>
												<option value="">Sin especificar</option>
												{categorias.map(c => (
													<option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
												))}
											</select>
										</div>

										<div>
											<label className={labelClasses}>Marca (MM'SS"ms)</label>
											<input
												type="text"
												value={editMarca}
												onChange={(e) => { setEditMarca(formatMarcaTiempo(e.target.value)); setEditFormatoError(false); }}
												onBlur={() => { if (editMarca && !REGEX_MARCA.test(editMarca)) setEditFormatoError(true); else setEditFormatoError(false); }}
												className={`w-full bg-oscuro border p-3 rounded-lg text-xl text-ianuarius outline-none transition font-mono ${editFormatoError ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-white/10 focus:border-ianuarius'}`}
											/>
											{editFormatoError && (
												<p className="text-red-400 text-[10px] mt-1 uppercase tracking-wider">Formato incorrecto — usa MM'SS"ms</p>
											)}
										</div>

										<div>
											<label className={labelClasses}>Sensaciones <span className="normal-case text-gray-600 font-normal">(opcional)</span></label>
											<div className="flex gap-2 mb-2">
												{SENSACIONES.map((emoji, i) => {
													const val = i + 1;
													return (
														<button
															key={val}
															type="button"
															onClick={() => setEditSensacionesValor(editSensacionesValor === val ? null : val)}
															className={`flex-1 text-lg py-1.5 rounded-lg border transition ${editSensacionesValor === val ? 'border-ianuarius bg-ianuarius/15' : 'border-white/10 bg-oscuro hover:border-white/30'}`}
														>
															{emoji}
														</button>
													);
												})}
											</div>
											<textarea
												value={editSensacionesNotas}
												onChange={e => setEditSensacionesNotas(e.target.value)}
												placeholder="Notas opcionales..."
												maxLength={500}
												rows={2}
												className="w-full bg-oscuro border border-white/10 p-2 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-ianuarius transition resize-none"
											/>
										</div>

										<div className="flex gap-2">
											<button
												onClick={() => setEditandoId(null)}
												className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/10 text-gray-400 rounded hover:bg-white/5 transition"
											>
												Cancelar
											</button>

											<button
												onClick={() => handleGuardarEdicion(m.id_marca)}
												disabled={guardandoEdicion}
												className="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest bg-white text-oscuro rounded hover:bg-ianuarius hover:text-white transition disabled:opacity-50"
											>
												{guardandoEdicion ? '...' : 'Guardar'}
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>

					{!cargando && (
						<div className="mt-6 shrink-0 space-y-3">

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

									<span className="text-[10px] text-gray-400 font-mono">
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

							{hayMas && (
								<button
									onClick={toggleVerTodas}
									className="w-full py-3 border border-dashed border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-[0.3em] hover:text-white hover:border-white transition duration-300"
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

			{/* formulario nueva marca */}
			<aside className="lg:col-span-5 lg:self-start">
				<div className="bg-gris p-6 md:p-8 rounded-2xl border-t-8 border-ianuarius shadow-2xl">
					<div className="shrink-0">
						<h2 className="text-xl md:text-2xl font-extrabold mb-2 tracking-tight">Nueva Marca</h2>
						<p className="text-gray-400 text-xs mb-6 md:mb-8 uppercase tracking-widest font-semibold">Guardar tiempo en bd</p>

						{feedbackMsg && (
							<div className={`mb-5 p-3 rounded-lg text-xs font-bold uppercase tracking-widest text-center ${feedbackMsg.tipo === 'ok' ? 'bg-green-500/10 border border-green-500 text-green-400' : 'bg-red-500/10 border border-red-500 text-red-400'}`}>
								{feedbackMsg.texto}
							</div>
						)}
					</div>

					<form onSubmit={handleGuardarMarca} className="space-y-6">

						<div>
							<label className={labelClasses}>Competición</label>
							{cargandoEventos ? (
								<div className="w-full bg-oscuro border border-white/10 p-4 md:p-3 rounded-lg text-sm text-gray-500 animate-pulse">
									Cargando competiciones...
								</div>
							) : competiciones.length === 0 ? (
								<div className="border border-dashed border-gray-700 rounded-lg py-5 px-3 text-center">
									<p className="text-gray-500 text-xs uppercase tracking-widest">Sin competiciones en el calendario</p>
									<p className="text-gray-600 text-[10px] mt-1">Pide a tu entrenador que añada la competición antes de registrar una marca</p>
								</div>
							) : (
								<>
									<select
										value={eventoSeleccionado?.id_evento ?? ''}
										onChange={(e) => {
											const id = parseInt(e.target.value);
											setEventoSeleccionado(id ? (competiciones.find(c => c.id_evento === id) ?? null) : null);
										}}
										className={selectClasses}
										required
									>
										<option value="">Seleccionar competición</option>
										{competiciones.map(c => (
											<option key={c.id_evento} value={c.id_evento}>
												{c.titulo} — {formatFechaEvento(c.fecha_hora)}
											</option>
										))}
									</select>
									{eventoSeleccionado && (
										<p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider">
											{MAP_TIPO[eventoSeleccionado.tipo_evento]} · {etiquetaTipoPista(eventoSeleccionado.tipo_pista)}
										</p>
									)}
								</>
							)}
						</div>

						<div>
							<label className={labelClasses}>Prueba</label>
							<PruebaSelect pruebas={pruebas} value={prueba} onChange={setPrueba} />
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
							<label className={labelClasses}>Marca Final (MM'SS"ms)</label>
							<input
								type="text"
								placeholder={`00'00"00`}
								value={marcaTiempo}
								onChange={(e) => { setMarcaTiempo(formatMarcaTiempo(e.target.value)); setFormatoError(false); }}
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

						<div>
							<label className={labelClasses}>Sensaciones <span className="normal-case text-gray-600 font-normal">(opcional)</span></label>
							<div className="flex gap-2 mb-3">
								{SENSACIONES.map((emoji, i) => {
									const val = i + 1;
									return (
										<button
											key={val}
											type="button"
											onClick={() => setSensacionesValor(sensacionesValor === val ? null : val)}
											className={`flex-1 text-xl py-2 rounded-lg border transition ${sensacionesValor === val ? 'border-ianuarius bg-ianuarius/15' : 'border-white/10 bg-oscuro hover:border-white/30'}`}
											title={['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente'][i]}
										>
											{emoji}
										</button>
									);
								})}
							</div>
							<textarea
								value={sensacionesNotas}
								onChange={e => setSensacionesNotas(e.target.value)}
								placeholder="Notas opcionales..."
								maxLength={500}
								rows={2}
								className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-ianuarius transition resize-none"
							/>
						</div>

						<button
							type="submit"
							disabled={guardando || !eventoSeleccionado || cargandoEventos}
							className="w-full bg-white text-oscuro font-black py-5 md:py-4 rounded-xl text-sm lg:text-xs uppercase tracking-[0.3em] hover:bg-ianuarius hover:text-white transition duration-500 shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(254,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{guardando ? 'Guardando...' : 'Guardar Registro'}
						</button>

					</form>
				</div>
			</aside>

		</div>
		</main>
	);

}
