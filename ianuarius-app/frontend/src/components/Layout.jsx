import { useState, useEffect, useRef, useCallback } from 'react';
import { API } from '../api';

// tiempo de inactividad antes de mostrar el aviso (15 min)
const INACTIVIDAD_MS = 15 * 60 * 1000;
// cuenta atras al aparecer el aviso (2 min)
const COUNTDOWN_SEGS = 2 * 60;

// plantilla principal para vistas autenticadas
export default function Layout({ children, user, onLogout, onUserUpdate, currentView, onNavigate }) {
	// control estados menu lateral
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isPinned, setIsPinned] = useState(() => window.innerWidth >= 1024);
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
	const menuRef = useRef(null);
	const btnRef = useRef(null);

	// estados banner de inactividad
	const [mostrarAviso, setMostrarAviso] = useState(false);
	const [countdown, setCountdown] = useState(COUNTDOWN_SEGS);
	const inactividadTimer = useRef(null);
	const countdownTimer = useRef(null);
	const onLogoutRef = useRef(onLogout);
	// ref para que los event listeners no tengan stale closure de mostrarAviso
	const mostrarAvisoRef = useRef(false);

	// mantener refs actualizadas
	useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);
	useEffect(() => { mostrarAvisoRef.current = mostrarAviso; }, [mostrarAviso]);

	// detectar cambio escritorio/movil — en movil nunca pinned
	useEffect(() => {
		const mql = window.matchMedia('(min-width: 1024px)');
		const handler = (e) => {
			const mobile = !e.matches;
			setIsMobile(mobile);
			if (mobile) setIsPinned(false);
		};

		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);

	}, []);

	// llama al backend para destruir la sesion y limpia el estado de React
	const handleLogout = useCallback(() => {
		clearTimeout(inactividadTimer.current);
		clearInterval(countdownTimer.current);
		fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
		.finally(() => onLogoutRef.current());

	}, []);

	// inicia el countdown cuando aparece el aviso
	const iniciarCountdown = useCallback(() => {
		setMostrarAviso(true);
		setCountdown(COUNTDOWN_SEGS);
		let segs = COUNTDOWN_SEGS;
		clearInterval(countdownTimer.current);

		countdownTimer.current = setInterval(() => {
			segs -= 1;
			setCountdown(segs);
			if (segs <= 0) {
				clearInterval(countdownTimer.current);
				handleLogout();
			}

		}, 1000);

	}, [handleLogout]);

	// reinicia el timer de inactividad tras cualquier interaccion del DOM
	// IMPORTANTE: si banner visible, ignora — solo continuarSesion() puede cerrarlo
	const resetInactividad = useCallback(() => {
		if (mostrarAvisoRef.current) return;
		clearTimeout(inactividadTimer.current);
		clearInterval(countdownTimer.current);
		setMostrarAviso(false);
		setCountdown(COUNTDOWN_SEGS);
		inactividadTimer.current = setTimeout(iniciarCountdown, INACTIVIDAD_MS);

	}, [iniciarCountdown]);

	// llamado SOLO por el boton del banner — sin guard
	const continuarSesion = useCallback(() => {
		clearTimeout(inactividadTimer.current);
		clearInterval(countdownTimer.current);
		setMostrarAviso(false);
		setCountdown(COUNTDOWN_SEGS);
		inactividadTimer.current = setTimeout(iniciarCountdown, INACTIVIDAD_MS);

	}, [iniciarCountdown]);

	// registrar eventos de actividad del usuario
	useEffect(() => {
		const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
		eventos.forEach(e => document.addEventListener(e, resetInactividad));
		resetInactividad(); // arrancar timer inicial

		return () => {
			eventos.forEach(e => document.removeEventListener(e, resetInactividad));
			clearTimeout(inactividadTimer.current);
			clearInterval(countdownTimer.current);
		};

	}, [resetInactividad]);

	// formato MM:SS del countdown
	const formatCountdown = (segs) => {
		const m = String(Math.floor(segs / 60)).padStart(2, '0');
		const s = String(segs % 60).padStart(2, '0');
		return `${m}:${s}`;
	};

	// maneja click fuera de menu para cerrarlo
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isMenuOpen &&
				!isPinned &&
				menuRef.current &&
				!menuRef.current.contains(event.target) &&
				btnRef.current &&
				!btnRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);

	}, [isMenuOpen, isPinned]);

	return (
		<div className="bg-oscuro font-sans antialiased text-gray-200 flex flex-col min-h-screen overflow-x-hidden">

			{/* overlay bloqueador — impide interactuar con la pagina mientras el banner esta visible */}
			{mostrarAviso && (
				<div className="fixed inset-0 z-199 bg-oscuro/60 backdrop-blur-[2px]" />
			)}

			{/* banner inactividad */}
			<div className={`fixed top-0 left-0 right-0 z-200 transition-transform duration-500 ease-out ${mostrarAviso ? 'translate-y-0' : '-translate-y-full'}`}>
				<div className="bg-gris border-b-2 border-ianuarius shadow-[0_4px_30px_rgba(254,0,0,0.3)] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						{/* icono reloj */}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-ianuarius shrink-0">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
						</svg>

						<div>
							<p className="text-white text-sm font-bold">¿Sigues ahí?</p>
							<p className="text-gray-400 text-xs">La sesion se cerrara automaticamente en
								<span className="text-ianuarius font-mono font-bold ml-1">{formatCountdown(countdown)}</span>
							</p>
						</div>

					</div>

					<div className="flex gap-3 shrink-0">
						<button onClick={continuarSesion} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-white text-oscuro rounded hover:bg-ianuarius hover:text-white transition duration-300">Continuar sesion</button>

						<button onClick={handleLogout} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest border border-ianuarius text-ianuarius rounded hover:bg-ianuarius hover:text-white transition duration-300">Cerrar sesion</button>

					</div>
				</div>
			</div>

			{/* menu lateral */}
			<aside
				ref={menuRef}
				className={`fixed right-0 top-0 h-full w-64 bg-gris border-l border-white/10 transform transition-transform duration-300 z-50 p-6 flex flex-col shadow-2xl ${isMenuOpen || (isPinned && !isMobile) ? 'translate-x-0' : 'translate-x-full'}`}>
				<div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
					<h3 className="font-bold tracking-widest uppercase text-sm">Navegacion</h3>
					<div className="flex gap-3 items-center">
						<button onClick={() => setIsPinned(!isPinned)} className={`transition ${isPinned ? 'text-ianuarius' : 'text-gray-400 hover:text-white'}`}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 3h-6m3 12v6m-2.5-6h5l1.5-3v-2l-1.5-1V3h-5v6l-1.5 1v2l1.5 3z" />
							</svg>
						
						</button>

						<button onClick={() => { setIsMenuOpen(false); setIsPinned(false); }} className="text-gray-400 hover:text-ianuarius transition lg:hidden">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>

						</button>

					</div>
				</div>

				<nav className="space-y-6 grow">
					<button onClick={() => onNavigate?.('dashboard')} className={`block w-full text-left text-base lg:text-sm uppercase tracking-widest font-bold hover:translate-x-2 transition transform ${currentView === 'dashboard' ? 'text-ianuarius' : 'text-gray-400 hover:text-white'}`}>Inicio</button>
					<button onClick={() => { onNavigate?.('perfil'); setIsMenuOpen(false); }} className={`flex w-full items-center justify-between text-left text-base lg:text-sm uppercase tracking-widest font-bold hover:translate-x-2 transition transform ${currentView === 'perfil' ? 'text-ianuarius' : 'text-gray-400 hover:text-white'}`}>
						Mi Perfil
						{(!user?.foto_dni || !user?.foto_carnet) && (
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 text-yellow-400 shrink-0">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
						)}
					</button>

					<button onClick={() => { onNavigate?.('inscripcion'); setIsMenuOpen(false); }} className={`flex w-full items-center justify-between text-left text-base lg:text-sm uppercase tracking-widest font-bold hover:translate-x-2 transition transform ${currentView === 'inscripcion' ? 'text-ianuarius' : 'text-gray-400 hover:text-white'}`}>
						Inscripción
						{(!user?.inscripcion_pdf && !user?.inscripcion_formulario) && (
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3.5 h-3.5 text-yellow-400 shrink-0">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
						)}
					</button>

					<a href="#" className="block text-base lg:text-sm uppercase tracking-widest text-gray-400 hover:text-white hover:translate-x-2 transition transform">Historico</a>
					<a href="#" className="block text-base lg:text-sm uppercase tracking-widest text-gray-400 hover:text-white hover:translate-x-2 transition transform">Estadisticas</a>
				
				</nav>
			</aside>

			{/* wrapper dinamico contenido */}
			<div className="grow p-4 md:p-10 max-w-7xl mx-auto w-full">

				<header className="mb-8 md:mb-12 border-b-2 border-ianuarius pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
					<div className="flex items-center gap-5">
						<button
							onClick={() => onNavigate?.('perfil')}
							className="relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shadow-lg group cursor-pointer"
							title="Mi Perfil"
						>
							{user?.foto_perfil ? (
								<img src={user.foto_perfil} alt="Foto de perfil" className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full bg-ianuarius flex items-center justify-center">
									<span className="text-white font-black text-lg tracking-widest">
										{((user?.nombre?.[0] || '') + (user?.apellidos?.[0] || '')).toUpperCase()}
									</span>
								</div>
							)}
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-white">
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
								</svg>
							</div>
						</button>

						<div className="space-y-2">
							<h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
								style={{ color: 'transparent', WebkitTextStroke: '1px #FFFFFF', fontFamily: "'Graduate', sans-serif" }}>
								Panel de Atleta
							</h1>

							<div className="flex items-center gap-3">
								<span className="w-3 h-3 bg-ianuarius rounded-full animate-pulse"></span>
								<p className="text-ianuarius font-black tracking-[0.4em] text-xs md:text-sm uppercase">
									Sesion activa: {user?.nombre || 'Atleta Ianuarius'}
								</p>
							</div>

						</div>

					</div>

					<div className="flex gap-3 md:gap-4 items-center w-full md:w-auto justify-end">
						<button onClick={handleLogout} className="bg-ianuarius px-4 py-3 md:px-4 md:py-2 rounded text-xs md:text-[10px] font-bold tracking-widest uppercase hover:bg-red-700 transition duration-300">
							Cerrar Sesion
						</button>

						<button ref={btnRef} onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-ianuarius transition p-2 ml-1">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7 md:w-6 md:h-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>

						</button>
					</div>
				</header>

				{/* banner pendientes en dashboard */}
				{currentView === 'dashboard' && (() => {
					const items = [
						!user?.foto_dni            && { label: 'DNI escaneado',      nav: 'perfil'      },
						!user?.foto_carnet         && { label: 'Foto de carnet',      nav: 'perfil'      },
						(!user?.inscripcion_pdf && !user?.inscripcion_formulario) && { label: 'Ficha de inscripción', nav: 'inscripcion' },
					].filter(Boolean);
					if (!items.length) return null;
					return (
						<div className="mb-6 bg-yellow-400/5 border border-yellow-400/15 rounded-xl p-4 flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
							<div>
								<p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-2">Completa tu perfil</p>
								<div className="flex flex-wrap gap-2">
									{items.map(item => (
										<button
											key={item.label}
											onClick={() => onNavigate?.(item.nav)}
											className="text-[10px] bg-yellow-400/10 border border-yellow-400/25 text-yellow-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider hover:bg-yellow-400/20 transition"
										>
											{item.label} →
										</button>
									))}
								</div>
							</div>
						</div>
					);
				})()}

				{/* renderizado dinamico */}
				{children}

			</div>

			{/* footer */}
			<footer className="w-full py-8 mt-auto flex justify-center border-t border-white/5">
				<div className="max-w-md w-full text-center">
					<p className="text-xs md:text-[9px] text-gray-600 uppercase tracking-[0.5em] leading-relaxed">
						Ianuarius Athletics Club &copy; 2026<br />
						<span className="opacity-50">Tecnificacion en Salamanca</span>
					</p>
					
				</div>
			</footer>

		</div>
	);

}
