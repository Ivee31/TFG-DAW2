import { useState, useEffect } from 'react';
import { API } from '../api';
import PerfilAtleta from './PerfilAtleta';

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

	const cargarPendientes = () => {
		setCargandoP(true);
		fetch(`${API}/admin/pendientes`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => { if (data.status === 'success') setPendientes(data.pendientes); })
			.finally(() => setCargandoP(false));

	};

	useEffect(() => {
		cargarPendientes();
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

	if (atletaSeleccionado) {
		return <PerfilAtleta atletaId={atletaSeleccionado} onVolver={() => setAtletaSeleccionado(null)} />;
	}

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
									? (cargandoA ? '...' : `${atletas.length} atletas activos`)
									: (cargandoE ? '...' : `${entrenadores.length} entrenadores activos`)}
							</p>
						</div>
						<div className="flex items-center gap-1 bg-oscuro/60 border border-white/10 rounded-lg p-1">
							<button
								onClick={() => setTab('atletas')}
								className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition ${tab === 'atletas' ? 'bg-ianuarius text-white' : 'text-gray-400 hover:text-white'}`}
							>
								Atletas
							</button>
							<button
								onClick={() => setTab('entrenadores')}
								className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition ${tab === 'entrenadores' ? 'bg-ianuarius text-white' : 'text-gray-400 hover:text-white'}`}
							>
								Entrenadores
							</button>
						</div>
					</div>

					{/* tab atletas */}
					{tab === 'atletas' && (
						<>
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

							{!cargandoA && atletas.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
									{atletas.map(a => (
										<div key={a.id_usuario}
											onClick={() => setAtletaSeleccionado(a.id_usuario)}
											className="bg-oscuro/50 p-4 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-300 cursor-pointer">
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
						</>
					)}

					{/* tab entrenadores */}
					{tab === 'entrenadores' && (
						<>
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

							{!cargandoE && entrenadores.length > 0 && (
								<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
									{entrenadores.map(e => (
										<div key={e.id_usuario}
											className="bg-oscuro/50 p-4 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-300">
											<div className="flex items-start gap-3">
												<UsuarioAvatar fotoPerfil={e.foto_perfil} fotoCarnet={e.foto_carnet} nombre={e.nombre} apellidos={e.apellidos} />
												<div className="flex-1 min-w-0">
													<h3 className="text-white font-bold text-sm truncate">
														{e.apellidos}, {e.nombre}
													</h3>
													<p className="text-gray-400 text-[10px] truncate mt-0.5">{e.email}</p>
													<div className="mt-2 pt-2 border-t border-white/5">
														<span className="text-[10px] text-gray-400 uppercase tracking-widest">
															{e.genero === 'M' ? 'Masculino' : 'Femenino'}
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
		</main>
	);

}
