import { useState, useEffect } from 'react';
import { API } from '../api';
import PerfilAtleta from './PerfilAtleta';

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

export default function DashboardEntrenador() {
	const [atletas, setAtletas]                 = useState([]);
	const [cargando, setCargando]               = useState(true);
	const [error, setError]                     = useState(null);
	const [atletaSeleccionado, setAtletaSeleccionado] = useState(null);

	const [busqueda, setBusqueda]               = useState('');
	const [filtroGenero, setFiltroGenero]       = useState('todos');
	const [filtroCategoria, setFiltroCategoria] = useState('');

	useEffect(() => {
		fetch(`${API}/usuarios/atletas`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') setAtletas(data.atletas);
				else setError(data.error);
			})
			.catch(() => setError('Error de conexión'))
			.finally(() => setCargando(false));
	}, []);

	if (atletaSeleccionado) {
		return <PerfilAtleta atletaId={atletaSeleccionado} onVolver={() => setAtletaSeleccionado(null)} />;
	}

	const categoriasDisponibles = [...new Set(atletas.map(a => calcularCategoria(a.fecha_nacimiento, a.genero)))]
		.sort((a, b) => CATEGORIA_ORDEN.indexOf(a) - CATEGORIA_ORDEN.indexOf(b));

	const atletasFiltrados = atletas.filter(a => {
		const q = busqueda.toLowerCase().trim();
		const matchBusqueda = !q ||
			`${a.nombre} ${a.apellidos}`.toLowerCase().includes(q) ||
			a.email.toLowerCase().includes(q);
		const matchGenero    = filtroGenero === 'todos' || a.genero === filtroGenero;
		const matchCategoria = !filtroCategoria || calcularCategoria(a.fecha_nacimiento, a.genero) === filtroCategoria;
		return matchBusqueda && matchGenero && matchCategoria;
	});

	const hayFiltros = busqueda.trim() || filtroGenero !== 'todos' || filtroCategoria;

	return (
		<main>
			<div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
				<div className="flex justify-between items-center mb-6 md:mb-8">
					<div>
						<h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Atletas del Club</h2>
						<p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-semibold">
							{cargando ? '...' : hayFiltros
								? `${atletasFiltrados.length} de ${atletas.length} atletas`
								: `${atletas.length} atletas activos`}
						</p>
					</div>

					<span className="text-[10px] bg-ianuarius/20 text-ianuarius px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">
						Temporada 2026
					</span>
				</div>

				{!cargando && !error && atletas.length > 0 && (
					<div className="flex flex-col sm:flex-row gap-3 mb-6">
						<div className="relative flex-1">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none">
								<path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
							</svg>
							<input
								type="text"
								value={busqueda}
								onChange={e => setBusqueda(e.target.value)}
								placeholder="Buscar por nombre o email..."
								className="w-full bg-oscuro border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-ianuarius transition"
							/>
						</div>

						<div className="flex items-center gap-1 bg-oscuro/60 border border-white/10 rounded-lg p-1 shrink-0">
							{[['todos','Todos'],['M','Masc'],['F','Fem']].map(([val, label]) => (
								<button
									key={val}
									onClick={() => setFiltroGenero(val)}
									className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition ${filtroGenero === val ? 'bg-ianuarius text-white' : 'text-gray-400 hover:text-white'}`}
								>
									{label}
								</button>
							))}
						</div>

						{categoriasDisponibles.length > 1 && (
							<select
								value={filtroCategoria}
								onChange={e => setFiltroCategoria(e.target.value)}
								className="bg-oscuro border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-ianuarius appearance-none cursor-pointer shrink-0"
							>
								<option value="">Todas las categorías</option>
								{categoriasDisponibles.map(c => (
									<option key={c} value={c}>{c}</option>
								))}
							</select>
						)}
					</div>
				)}

				{cargando && (
					<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10">
						Cargando atletas...
					</p>
				)}

				{error && (
					<p className="text-red-400 text-xs uppercase tracking-widest text-center py-10">
						{error}
					</p>
				)}

				{!cargando && !error && atletas.length === 0 && (
					<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
						No hay atletas registrados
					</p>
				)}

				{!cargando && !error && atletas.length > 0 && atletasFiltrados.length === 0 && (
					<p className="text-gray-400 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
						Sin resultados para los filtros aplicados
					</p>
				)}

				{!cargando && !error && atletasFiltrados.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
						{atletasFiltrados.map(a => (
							<div
								key={a.id_usuario}
								onClick={() => setAtletaSeleccionado(a.id_usuario)}
								className="bg-oscuro/50 p-4 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-300 cursor-pointer"
							>
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
											<span className="text-[10px] font-bold text-gray-400">
												{a.total_marcas} {parseInt(a.total_marcas) === 1 ? 'marca' : 'marcas'}
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
