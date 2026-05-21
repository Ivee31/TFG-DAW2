// vista Home
import { useState, useEffect, useRef } from "react";
import AuthModal from './AuthModal';
import logoIanuarius from '../assets/logoIanuarius.webp';
import logoInstagram from '../assets/logoInstagram.webp';
import fondoLanding from '../assets/fondoLanding.webp';

// ELEMENTOS HARDCODEADOS PARA EL MOCKUP DE LAS NOTICIAS
import llanoAlto from '../assets/llanoAltoAlbergue.webp';
import record400 from '../assets/record400New.webp';
import calendar from '../assets/calendar.webp';

import { attachFocusTrap } from '../utils/focusTrap';
import BackToTop from './BackToTop';

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
		img: calendar,
		categoria: 'Itinerario',
		titulo: 'RFEA anuncia el calendario oficial de competiciones para la temporada 2026',
		fecha: '15 abr 2026',
	},
	{
		img: llanoAlto,
		categoria: 'Club',
		titulo: 'Concentraciones de entrenamiento Ianuarius en LLano Alto, Bejar — jornadas de entrenamiento y convivencia para atletas y entrenadores del club.',
		fecha: '25 sep 2026',
	},
	{
		img: record400,
		categoria: 'Competicion',
		titulo: 'Nuevo récord personal en 400m lisos en el control autonomico de primavera',
		fecha: '5 may 2026',
	},
];

export default function Home({ onLoginSuccess, onGoogleNeedsCompletion }) {
	const [authMode, setAuthMode] = useState(null);
	const [cookiesAceptadas, setCookiesAceptadas] = useState(
		() => localStorage.getItem('cookies_aceptadas') === 'true'
	);

	const aceptarCookies = () => {
		localStorage.setItem('cookies_aceptadas', 'true');
		setCookiesAceptadas(true);
	};

	const openLogin    = () => setAuthMode('login');
	const openRegister = () => setAuthMode('register');
	const closeAll     = () => setAuthMode(null);

	// url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70')

	return (
		<div className="bg-oscuro text-gray-200 font-sans antialiased overflow-x-hidden">
			<style>{`
				.bg-hero {
					background: linear-gradient(to bottom, rgba(23,23,23,0.80), rgba(23,23,23,0.95)),
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

				/* --- Instagram button --- */
				.insta-btn {
					width: 36px; height: 36px; position: relative;
					display: flex; align-items: center; justify-content: center;
					text-decoration: none; border: none; background: transparent;
					cursor: pointer; border-radius: 7px; transition: all .3s;
				}
				.insta-container {
					position: relative; z-index: 1;
					width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
					background: transparent; backdrop-filter: blur(4px);
					border-radius: 6px; transition: all .3s; border: 1px solid rgba(156,156,156,0.4);
					overflow: hidden;
				}
				.insta-bg {
					position: absolute; inset: 0;
					background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
					border-radius: 9px; transition: transform .3s;
				}
				.insta-btn:hover .insta-bg { transform: rotate(35deg); transform-origin: bottom; }
				.insta-btn:hover .insta-container { background: rgba(156,156,156,0.3); }

				/* --- Acceder button --- */
				.btn-acceder {
					cursor: pointer; position: relative;
					padding: 10px 32px; font-size: 10px;
					color: #ffffff; border: 2px solid rgba(255,255,255,0.4);
					border-radius: 6px; background: rgba(255,255,255,0.1);
					font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
					transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1); overflow: hidden;
				}
				.btn-acceder::before {
					content: ''; position: absolute; inset: 0;
					background: #FE0000;
					clip-path: circle(0% at center);
					transition: clip-path 1.1s cubic-bezier(0.23, 1, 0.320, 1);
				}
				.btn-acceder:hover::before { clip-path: circle(150% at center); transition: clip-path 1.8s cubic-bezier(0.23, 1, 0.320, 1); }
				.btn-acceder:hover { border-color: #FE0000; box-shadow: 0 0 20px rgba(254,0,0,0.4); scale: 1.05; }
				.btn-acceder:active { scale: 1; }

				/* --- Saber más / Leer más buttons --- */
				.btn-saber, .btn-saber-sm {
					position: relative; display: inline-block; cursor: pointer;
					outline: none; border: 0; vertical-align: middle;
					text-decoration: none; background: transparent; padding: 0;
					font-size: inherit; font-family: inherit;
				}
				.btn-saber { width: 12rem; }
				.btn-saber-sm { width: 8rem; }

				.btn-saber .circle, .btn-saber-sm .circle {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: relative; display: block; margin: 0;
					background: #262626; border: 1px solid rgba(255,255,255,0.15);
				}
				.btn-saber .circle { width: 2.5rem; height: 2.5rem; border-radius: 1.25rem; }
				.btn-saber-sm .circle { width: 1.75rem; height: 1.75rem; border-radius: 0.875rem; }

				.btn-saber .icon, .btn-saber-sm .icon {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: absolute; top: 0; bottom: 0; margin: auto; background: #fff;
				}
				.btn-saber .arrow { left: 0.5rem; width: 1rem; height: 0.125rem; background: none; }
				.btn-saber-sm .arrow { left: 0.35rem; width: 0.75rem; height: 0.1rem; background: none; }
				.btn-saber .arrow::before {
					position: absolute; content: ''; top: -0.25rem; right: 0.05rem;
					width: 0.55rem; height: 0.55rem;
					border-top: 0.125rem solid #fff; border-right: 0.125rem solid #fff;
					transform: rotate(45deg);
				}
				.btn-saber-sm .arrow::before {
					position: absolute; content: ''; top: -0.18rem; right: 0.05rem;
					width: 0.4rem; height: 0.4rem;
					border-top: 0.1rem solid #fff; border-right: 0.1rem solid #fff;
					transform: rotate(45deg);
				}

				.btn-saber .btn-text {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: absolute; top: 0; left: 0; right: 0; bottom: 0;
					padding: 0.65rem 0; margin: 0 0 0 2.5rem;
					color: #9ca3af; font-weight: 700; line-height: 1.6;
					text-align: center; text-transform: uppercase;
					font-size: 0.65rem; letter-spacing: 0.08em;
				}
				.btn-saber-sm .btn-text {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: absolute; top: 0; left: 0; right: 0; bottom: 0;
					padding: 0.4rem 0; margin: 0 0 0 1.75rem;
					color: #9ca3af; font-weight: 700; line-height: 1.6;
					text-align: center; text-transform: uppercase;
					font-size: 0.55rem; letter-spacing: 0.08em;
				}

				.btn-saber:hover .circle, .btn-saber-sm:hover .circle {
					width: 100%; background: #FE0000; border-color: transparent;
				}
				.btn-saber:hover .arrow { background: #fff; transform: translate(1rem, 0); }
				.btn-saber-sm:hover .arrow { background: #fff; transform: translate(0.65rem, 0); }
				.btn-saber:hover .btn-text, .btn-saber-sm:hover .btn-text { color: #fff; }

				@property --reg-hole {
					syntax: '<percentage>';
					inherits: false;
					initial-value: 0%;
				}

				/* --- Registrarse button --- */
				.btn-registrarse {
					cursor: pointer; position: relative;
					padding: 10px 32px; font-size: 10px;
					color: #ffffff; border: 2px solid #FE0000;
					border-radius: 6px; background: rgba(255,255,255,0.1);
					font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
					transition: all 0.3s cubic-bezier(0.23, 1, 0.320, 1); overflow: hidden;
					box-shadow: 0 0 20px rgba(254,0,0,0.4);
				}
				.btn-registrarse::before {
					content: ''; position: absolute; inset: 0;
					background: #FE0000;
					mask-image: radial-gradient(circle, transparent 0%, transparent var(--reg-hole), black var(--reg-hole));
					-webkit-mask-image: radial-gradient(circle, transparent 0%, transparent var(--reg-hole), black var(--reg-hole));
					transition: --reg-hole 0.9s cubic-bezier(0.23, 1, 0.320, 1);
				}
				.btn-registrarse:hover::before { --reg-hole: 150%; transition: --reg-hole 1.5s cubic-bezier(0.23, 1, 0.320, 1); }
				.btn-registrarse:hover { border-color: rgba(255,255,255,0.4); box-shadow: none; scale: 1.05; }
				.btn-registrarse:active { scale: 1; }

				/* --- Leer más button (versión roja pequeña) --- */
				.btn-leer-mas {
					position: relative; display: inline-block; cursor: pointer;
					outline: none; border: 0; vertical-align: middle;
					text-decoration: none; background: transparent; padding: 0;
					font-size: inherit; font-family: inherit; width: 8rem;
				}
				.btn-leer-mas .circle {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: relative; display: block; margin: 0;
					width: 1.75rem; height: 1.75rem; border-radius: 0.875rem;
					background: rgba(254,0,0,0.15); border: 1px solid #FE0000;
				}
				.btn-leer-mas .icon {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: absolute; top: 0; bottom: 0; margin: auto;
				}
				.btn-leer-mas .arrow {
					left: 0.25rem; width: 0.75rem; height: 0.1rem; background: none;
				}
				.btn-leer-mas .arrow::before {
					position: absolute; content: ''; top: -0.18rem; right: 0.05rem;
					width: 0.4rem; height: 0.4rem;
					border-top: 0.1rem solid #f87171; border-right: 0.1rem solid #f87171;
					transform: rotate(45deg);
					transition: border-color 0.45s cubic-bezier(0.65, 0, 0.076, 1);
				}
				.btn-leer-mas .btn-text {
					transition: all 0.45s cubic-bezier(0.65, 0, 0.076, 1);
					position: absolute; top: 0; left: 0; right: 0; bottom: 0;
					padding: 0.4rem 0; margin: 0 0 0 1.75rem;
					color: #f87171; font-weight: 700; line-height: 1.6;
					text-align: center; text-transform: uppercase;
					font-size: 0.55rem; letter-spacing: 0.08em;
				}
				.btn-leer-mas:hover .circle { width: 100%; background: #FE0000; border-color: transparent; }
				.btn-leer-mas:hover .arrow { background: #fff; transform: translate(0.65rem, 0); }
				.btn-leer-mas:hover .arrow::before { border-top-color: #fff; border-right-color: #fff; }
				.btn-leer-mas:hover .btn-text { color: #fff; }

				/* Cancelar hover en táctil para evitar animación pillada */
				@media (hover: none) {
					.insta-btn:hover .insta-bg { transform: none; }
					.insta-btn:hover .insta-container { background: transparent; }
				}

				/* Tamaño reducido en móvil */
				@media (max-width: 640px) {
					.insta-btn { width: 26px; height: 26px; border-radius: 5px; }
					.insta-bg  { border-radius: 6px; }
					.insta-container { border-radius: 4px; }
				}
			`}</style>

			{/* HERO */}
			<section className="min-h-screen w-full bg-hero flex flex-col">

				{/* NAV */}
				<nav className="w-full px-6 md:px-10 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-[72px] h-[72px] bg-oscuro/60 backdrop-blur-md rounded-full border border-white/40 flex items-center justify-center p-2 shadow-[0_0_10px_rgba(255,255,255,0.08)]">
							<img src={logoIanuarius} alt="Ianuarius" className="w-full h-full object-contain" />
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="text-white font-black text-sm tracking-[0.25em] uppercase">Ianuarius</span>
							<div className="flex items-center gap-2">
								<a
									href="https://www.instagram.com/c.a.i.s?igsh=N2Z2MXR2MGI3czI5"
									target="_blank"
									rel="noopener noreferrer"
									className="insta-btn"
									aria-label="Instagram de Ianuarius — @c.a.i.s, abre en nueva pestaña"
								>
									<span className="insta-bg" aria-hidden="true" />
									<span className="insta-container">
										<img src={logoInstagram} alt="" aria-hidden="true" className="w-full h-full object-contain scale-[1.25]" />
									</span>
								</a>
								<span className="text-[12px] text-gray-400 uppercase tracking-widest" aria-hidden="true">@c.a.i.s</span>
							</div>
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
							className="btn-registrarse"
							aria-label="Registrarse en la plataforma Ianuarius"
						>
							<span className="relative z-10">Registrarse</span>
						</button>
						<button
							onClick={openLogin}
							className="btn-acceder"
							aria-label="Acceder a la plataforma Ianuarius"
						>
							<span className="relative z-10">Acceder</span>
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
				<div className="flex flex-col items-center pb-28 gap-1.5">
					<span className="text-[9px] text-gray-300 uppercase tracking-[0.3em]">Descubre más</span>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="scroll-hint w-5 h-5 text-gray-300">
						<path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</div>

			</section>

			{/* NOTICIAS — MOCKUP */}
			<section className="bg-oscuro/40 px-6 md:px-12 pt-6 pb-16 max-w-[1400px] mx-auto -mt-20 rounded-t-2xl">

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
						<article key={i} className="bg-gris rounded-xl border border-white/20 overflow-hidden group relative flex flex-col">
							{/* mockup badge */}
							<div className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-black/60 backdrop-blur-sm border border-white/20 rounded text-[8px] font-black uppercase tracking-widest text-gray-400">
								Mockup
							</div>

							<div className="w-full h-40 overflow-hidden">
								<img
									src={n.img}
									alt={n.titulo}
									className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition duration-700"
								/>
							</div>

							<div className="p-5 space-y-2 flex-1">
								<div className="flex items-center justify-between">
									<span className="text-[9px] font-black uppercase tracking-widest text-red-400">{n.categoria}</span>
									<span className="text-[9px] text-gray-400">{n.fecha}</span>
								</div>
								<h3 className="text-white text-sm font-semibold leading-snug">{n.titulo}</h3>
								<p className="text-gray-400 text-xs leading-relaxed">
									Contenido de la noticia pendiente de implementar en una futura versión de la plataforma.
								</p>
							</div>

							<div className="px-5 pb-5">
								<button disabled className="btn-leer-mas cursor-not-allowed" aria-label="Leer artículo completo (no disponible)" aria-disabled="true">
									<span className="circle" aria-hidden="true">
										<span className="icon arrow" aria-hidden="true" />
									</span>
									<span className="btn-text">Leer más</span>
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
					<a href="#" className="btn-saber" aria-label="Ver resumen de noticias del club">
						<span className="circle" aria-hidden="true">
							<span className="icon arrow" />
						</span>
						<span className="btn-text">Saber más</span>
					</a>
				</div>

				<div className="lg:col-span-6 flex flex-col justify-center gap-8 lg:pr-8">
					<p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
						Gracias al atletismo, somos capaces de acortar grandes distancias y acercar metas que parecían inalcanzables. Nos encontramos en un momento crítico de la temporada. ¿Cómo podemos asegurar que nuestro rendimiento futuro sea impecable sin comprometer la técnica?
					</p>
					<p className="text-gray-400 text-base md:text-lg leading-relaxed font-light">
						<span className="text-white font-medium border-b border-ianuarius pb-1">Ianuarius</span> es la respuesta a este desafío. Desplegamos la pista de tartán para todos aquellos que contribuyen a hacer posible un deporte más fuerte y competitivo en el futuro.
					</p>
					<a href="#" className="btn-saber mt-2" aria-label="Descubre más sobre el club Ianuarius">
						<span className="circle" aria-hidden="true">
							<span className="icon arrow" />
						</span>
						<span className="btn-text">Descubre más</span>
					</a>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="w-full py-8 flex flex-col items-center gap-3 border-t border-white/15">
				<p className="text-[9px] text-gray-400 uppercase tracking-[0.5em] text-center leading-relaxed">
					Ianuarius Athletics Club &copy; 2026<br />
					<a href="?page=aviso-legal" className="hover:text-gray-400 transition underline underline-offset-2">Aviso Legal</a>
				</p>
			</footer>

			{/* MODALES */}
			{authMode && (
				<Modal onClose={closeAll}>
					<AuthModal
						onLoginSuccess={onLoginSuccess}
						onGoogleNeedsCompletion={onGoogleNeedsCompletion}
						initialMode={authMode}
					/>
				</Modal>
			)}

			<BackToTop />

			{/* BANNER COOKIES */}
			{!cookiesAceptadas && (
				<div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
					<div className="max-w-3xl mx-auto bg-gris border border-white/20 border-t-2 border-t-ianuarius rounded-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
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
							className="shrink-0 px-6 py-2.5 bg-red-600 text-white label-caps rounded hover:bg-red-700 transition duration-300"
						>
							Aceptar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
