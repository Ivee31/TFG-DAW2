// vista Home
import { useState, useEffect, useRef } from "react";
import Login from './Login';
import Register from './Register';
import logoIanuarius from '../assets/logoIanuarius.webp';
import logoInstagram from '../assets/logoInstagram.webp';
import fondoLanding from '../assets/fondoLanding.webp';

// ELEMENTOS HARDCODEADOS PARA EL MOCKUP DE LAS NOTICIAS
import llanoAlto from '../assets/llanoAltoAlbergue.webp';
import record400 from '../assets/record400New.webp';

import { attachFocusTrap } from '../utils/focusTrap';

function Modal({ onClose, children }) {
	const containerRef = useRef(null);

	useEffect(() => {
		if (!containerRef.current) return;
		return attachFocusTrap(containerRef.current, onClose);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
			onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			<div
				ref={containerRef}
				role="dialog"
				aria-modal="true"
				className="relative w-full max-w-sm md:max-w-md"
				onClick={e => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-gris border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/50 transition"
					aria-label="Cerrar"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
						<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
					</svg>
				</button>
				{children}
			</div>
		</div>
	);
}

const noticias = [
	{
		img: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=70',
		categoria: 'Competición',
		titulo: 'RFEA anuncia el calendario oficial de competiciones para la temporada 2026',
		fecha: '15 abr 2026',
	},
	{
		img: llanoAlto,
		categoria: 'Club',
		titulo: 'Campus de verano Ianuarius — entrenamiento intensivo para jóvenes atletas',
		fecha: '8 may 2026',
	},
	{
		img: record400,
		categoria: 'Atletismo',
		titulo: 'Nuevo récord personal en 400m lisos en el control autonomico de primavera',
		fecha: '5 may 2026',
	},
];

export default function Home({ onLoginSuccess, onGoogleNeedsCompletion }) {
	const [showLogin, setShowLogin]       = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [cookiesAceptadas, setCookiesAceptadas] = useState(
		() => localStorage.getItem('cookies_aceptadas') === 'true'
	);

	const aceptarCookies = () => {
		localStorage.setItem('cookies_aceptadas', 'true');
		setCookiesAceptadas(true);
	};

	const openLogin    = () => { setShowLogin(true);  setShowRegister(false); };
	const openRegister = () => { setShowRegister(true); setShowLogin(false); };
	const closeAll     = () => { setShowLogin(false); setShowRegister(false); };

	// url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70')

	return (
		<div className="bg-oscuro text-gray-200 font-sans antialiased overflow-x-hidden">
			<style>{`
				.bg-hero {
					background: linear-gradient(to bottom, rgba(23,23,23,0.70), rgba(23,23,23,0.95)),
					            url('${fondoLanding}')
					            no-repeat center center;
					background-size: cover;
				}
				.titulo-collegiate {
					font-family: 'Graduate', sans-serif;
					color: transparent;
					-webkit-text-stroke: 3px #FFFFFF;
				}
				@keyframes scrollBounce {
					0%, 100% { transform: translateY(0); opacity: 0.4; }
					50%       { transform: translateY(8px); opacity: 0.9; }
				}
				.scroll-hint { animation: scrollBounce 1.8s ease-in-out infinite; }
			`}</style>

			{/* HERO */}
			<section className="min-h-[80vh] w-full bg-hero flex flex-col">

				{/* NAV */}
				<nav className="w-full px-6 md:px-10 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-14 h-14 bg-oscuro/60 backdrop-blur-md rounded-full border border-ianuarius/50 flex items-center justify-center p-2 shadow-[0_0_14px_rgba(254,0,0,0.3)]">
							<img src={logoIanuarius} alt="Ianuarius" className="w-full h-full object-contain" />
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-white font-black text-sm tracking-[0.25em] uppercase">Ianuarius</span>
							<a
								href="https://www.instagram.com/c.a.i.s?igsh=N2Z2MXR2MGI3czI5"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 hover:opacity-70 transition"
								aria-label="Instagram de Ianuarius"
							>
								<img src={logoInstagram} alt="" className="w-5 h-5 object-contain" />
								<span className="text-[10px] text-gray-400 uppercase tracking-widest">@c.a.i.s</span>
							</a>
						</div>
					</div>

				</nav>

				{/* HERO CENTER */}
				<div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-6">

					<h1 className="titulo-collegiate text-5xl md:text-6xl lg:text-[5rem] tracking-widest select-none drop-shadow-[0_0_30px_rgba(254,0,0,0.2)]">
						IANUARIUS
					</h1>

					<p className="text-[10px] md:text-xs font-bold tracking-[0.5em] text-red-400 mt-3 mb-6">
						A T L E T I S M O
					</p>

					<p className="text-gray-300 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-light">
						Plataforma de gestión deportiva para atletas y entrenadores — registra marcas, consulta el calendario y gestiona tu documentación en un solo lugar.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
						<button
							onClick={openRegister}
							className="px-8 py-3 bg-red-600 text-white font-black text-[10px] tracking-widest uppercase rounded shadow-[0_0_20px_rgba(254,0,0,0.4)] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(254,0,0,0.6)] transition duration-300"
						>
							Registrarse
						</button>

						<button
							onClick={openLogin}
							className="px-8 py-3 bg-white/10 border border-white/40 text-white font-black text-[10px] tracking-widest uppercase rounded hover:border-white hover:bg-white/20 transition duration-300"
						>
							Acceder
						</button>
					</div>

					{/* Puertas abiertas */}
				<div className="mb-10 max-w-sm text-center space-y-1">
					<p className="text-[9px] font-black uppercase tracking-widest text-red-400">Jornadas de puertas abiertas</p>
					<p className="text-gray-400 text-xs leading-relaxed">
						¿Tienes hijos que quieran probar el atletismo? Iniciación gratuita — primeras semanas de septiembre y junio.
					</p>
				</div>

				{/* Feature pills */}
					<div className="flex flex-wrap justify-center items-center gap-2 text-[10px] text-gray-400 tracking-widest uppercase">
						<span>Registro de marcas</span>
						<span aria-hidden="true" className="text-gray-400">·</span>
						<span>Calendario de eventos</span>
						<span aria-hidden="true" className="text-gray-400">·</span>
						<span>Gestión documental</span>
						<span aria-hidden="true" className="text-gray-400">·</span>
						<span>Inscripciones online</span>
					</div>

				</div>

				{/* SCROLL HINT */}
				<div className="flex flex-col items-center pb-8 gap-1.5">
					<span className="text-[9px] text-gray-300 uppercase tracking-[0.3em]">Descubre más</span>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="scroll-hint w-5 h-5 text-gray-300">
						<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</div>

			</section>

			{/* NOTICIAS — MOCKUP */}
			<section className="bg-oscuro px-6 md:px-12 py-16 max-w-[1400px] mx-auto">

				<div className="flex items-center justify-between mb-8">
					<h2 className="text-white font-black text-xl md:text-2xl tracking-widest uppercase">Últimas noticias</h2>
					<span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-[9px] font-black uppercase tracking-widest">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
							<path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
						</svg>
						Sección en desarrollo
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{noticias.map((n, i) => (
						<article key={i} className="bg-gris rounded-xl border border-white/10 overflow-hidden group relative">
							{/* mockup badge */}
							<div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded text-[8px] font-black uppercase tracking-widest text-gray-400">
								Mockup
							</div>

							<div className="w-full h-40 overflow-hidden">
								<img
									src={n.img}
									alt={n.titulo}
									className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-700"
								/>
							</div>

							<div className="p-5 space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-[9px] font-black uppercase tracking-widest text-red-400">{n.categoria}</span>
									<span className="text-[9px] text-gray-400">{n.fecha}</span>
								</div>
								<h3 className="text-white text-sm font-semibold leading-snug">{n.titulo}</h3>
								<p className="text-gray-400 text-xs leading-relaxed">
									Contenido de la noticia pendiente de implementar en una futura versión de la plataforma.
								</p>
								<button disabled className="text-ianuarius/40 text-[10px] font-bold tracking-wide cursor-not-allowed">
									Leer más →
								</button>
							</div>
						</article>
					))}
				</div>

			</section>

			{/* INFO SECTION */}
			<section className="bg-oscuro px-6 md:px-12 pb-16 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
				<div className="lg:col-span-6 bg-gris p-5 md:p-6 rounded-xl border-t-4 border-ianuarius shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
					<div className="w-full h-48 bg-oscuro rounded-lg mb-5 overflow-hidden relative group">
						<img
							src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=70"
							alt="Pista de atletismo"
							className="object-cover w-full h-full opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-700 ease-in-out"
						/>
					</div>
					<h3 className="text-xl md:text-2xl font-semibold text-white mb-3 leading-snug">Superar tus límites es posible, solo hay un paso...</h3>
					<p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">
						Ningún atleta en nuestra región entrena con la dedicación, las instalaciones y el seguimiento biométrico que ofrecemos en la disciplina de Ianuarius.
					</p>
					<a href="#" className="text-red-400 hover:text-white text-sm font-semibold tracking-wide flex items-center gap-2 transition">
						Resumen de noticias <span className="text-xl">&rarr;</span>
					</a>
				</div>

				<div className="lg:col-span-6 flex flex-col justify-center gap-8 lg:pr-8">
					<p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
						Gracias al atletismo, somos capaces de acortar grandes distancias y acercar metas que parecían inalcanzables. Nos encontramos en un momento crítico de la temporada. ¿Cómo podemos asegurar que nuestro rendimiento futuro sea impecable sin comprometer la técnica?
					</p>
					<p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
						<span className="text-white font-medium border-b border-ianuarius pb-1">Ianuarius</span> es la respuesta a este desafío. Desplegamos la pista de tartán para todos aquellos que contribuyen a hacer posible un deporte más fuerte y competitivo en el futuro.
					</p>
					<a href="#" className="text-white hover:text-ianuarius text-sm font-semibold tracking-wide flex items-center gap-2 mt-2 transition w-fit group">
						Descubre más sobre el club
						<span aria-hidden="true" className="text-ianuarius text-xl transform group-hover:translate-x-2 transition">&rarr;</span>
					</a>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="w-full py-8 flex flex-col items-center gap-3 border-t border-white/5">
				<p className="text-[9px] text-gray-400 uppercase tracking-[0.5em] text-center leading-relaxed">
					Ianuarius Athletics Club &copy; 2026<br />
					<a href="?page=aviso-legal" className="hover:text-gray-400 transition underline underline-offset-2">Aviso Legal</a>
				</p>
			</footer>

			{/* MODALES */}
			{showLogin && (
				<Modal onClose={closeAll}>
					<Login onLoginSuccess={onLoginSuccess} onGoogleNeedsCompletion={onGoogleNeedsCompletion} />
				</Modal>
			)}

			{showRegister && (
				<Modal onClose={closeAll}>
					<Register onRegisterSuccess={onLoginSuccess} onGoogleNeedsCompletion={onGoogleNeedsCompletion} />
				</Modal>
			)}

			{/* BANNER COOKIES */}
			{!cookiesAceptadas && (
				<div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
					<div className="max-w-3xl mx-auto bg-gris border border-white/10 border-t-2 border-t-ianuarius rounded-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
						<div className="flex-1">
							<p className="text-white text-xs font-bold uppercase tracking-widest mb-2">Uso de cookies</p>
							<p className="text-gray-400 text-xs leading-relaxed">
								Esta aplicación utiliza únicamente las cookies estrictamente necesarias para su funcionamiento.
								Concretamente, una <span className="text-white">cookie de sesión</span> (<code className="text-red-400 text-[11px]">PHPSESSID</code>) que
								identifica tu sesión iniciada y te mantiene autenticado mientras usas la app.
								Se elimina automáticamente al cerrar el navegador. No se usan cookies de análisis, publicidad ni terceros.
							</p>
						</div>
						<button
							onClick={aceptarCookies}
							className="shrink-0 px-6 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition duration-300"
						>
							Aceptar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
