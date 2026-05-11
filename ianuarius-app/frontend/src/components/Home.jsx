// vista Home
import { useState } from "react";
import Login from './Login';
import Register from './Register';
import logoIanuarius from '../assets/logoIanuarius.png';
import logoInstagram from '../assets/logoInstagram.png';

export default function Home({ onLoginSuccess, onGoogleNeedsCompletion }) {
	const [showLogin, setShowLogin] = useState(false);
	const [showRegister, setShowRegister] = useState(false);
	const [cookiesAceptadas, setCookiesAceptadas] = useState(
		() => localStorage.getItem('cookies_aceptadas') === 'true'
	);

	const aceptarCookies = () => {
		localStorage.setItem('cookies_aceptadas', 'true');
		setCookiesAceptadas(true);
	};

	const toggleLogin    = () => { setShowLogin(v => !v); setShowRegister(false); };
	const toggleRegister = () => { setShowRegister(v => !v); setShowLogin(false); };

	return (
		<div className="bg-oscuro text-gray-200 font-sans antialiased overflow-x-hidden">
			<style>{`
				.bg-hero {
					background: linear-gradient(to bottom, rgba(23,23,23,0.72), rgba(23,23,23,1)),
					            url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')
					            no-repeat center center;
					background-size: cover;
				}
				.titulo-collegiate {
					font-family: 'Graduate', sans-serif;
					color: transparent;
					-webkit-text-stroke: 3px #FFFFFF;
				}
			`}</style>

			{/* HERO */}
			<section className="min-h-screen w-full bg-hero flex flex-col">

				{/* NAV */}
				<nav className="w-full px-6 md:px-10 py-5 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 bg-oscuro/60 backdrop-blur-md rounded-full border border-ianuarius/50 flex items-center justify-center p-1.5 shadow-[0_0_12px_rgba(254,0,0,0.3)]">
							<img src={logoIanuarius} alt="Ianuarius" className="w-full h-full object-contain" />
						</div>
						<span className="text-white font-black text-xs tracking-[0.25em] uppercase">Ianuarius</span>
					</div>

					<a
						href="https://www.instagram.com/c.a.i.s?igsh=N2Z2MXR2MGI3czI5"
						target="_blank"
						rel="noopener noreferrer"
						className="opacity-60 hover:opacity-100 transition"
					>
						<img src={logoInstagram} alt="Instagram" className="w-6 h-6 object-contain" />
					</a>
				</nav>

				{/* HERO CENTER */}
				<div className="flex-1 flex flex-col items-center justify-start px-4 text-center pt-10 md:pt-14">

					<h1 className="titulo-collegiate text-5xl md:text-7xl lg:text-[7rem] tracking-widest select-none drop-shadow-[0_0_30px_rgba(254,0,0,0.2)]">
						IANUARIUS
					</h1>

					<p className="text-[10px] md:text-xs font-bold tracking-[0.5em] text-ianuarius mt-3 mb-6">
						A T L E T I S M O
					</p>

					<p className="text-gray-300 text-sm md:text-base max-w-lg mb-10 leading-relaxed font-light">
						Plataforma de gestión deportiva para atletas y entrenadores — registra marcas, consulta el calendario y gestiona tu documentación en un solo lugar.
					</p>

					{/* CTAs + dropdowns */}
					<div className="relative flex flex-col sm:flex-row items-center gap-3 mb-10">
						<button
							onClick={toggleRegister}
							className="px-8 py-3 bg-ianuarius text-white font-black text-[10px] tracking-widest uppercase rounded shadow-[0_0_20px_rgba(254,0,0,0.4)] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(254,0,0,0.6)] transition duration-300"
						>
							Registrarse
						</button>

						<button
							onClick={toggleLogin}
							className="px-8 py-3 border border-white/30 text-white font-black text-[10px] tracking-widest uppercase rounded hover:border-white hover:bg-white/5 transition duration-300"
						>
							Acceder
						</button>

						{showLogin && (
							<div className="absolute top-full mt-3 w-72 md:w-80 z-50 left-1/2 -translate-x-1/2">
								<Login onLoginSuccess={onLoginSuccess} onGoogleNeedsCompletion={onGoogleNeedsCompletion} />
							</div>
						)}

						{showRegister && (
							<div className="absolute top-full mt-3 w-80 md:w-96 z-50 left-1/2 -translate-x-1/2">
								<Register onRegisterSuccess={onLoginSuccess} onGoogleNeedsCompletion={onGoogleNeedsCompletion} />
							</div>
						)}
					</div>

					{/* Feature pills */}
					<div className="flex flex-wrap justify-center items-center gap-2 text-[10px] text-gray-500 tracking-widest uppercase">
						<span>Registro de marcas</span>
						<span className="text-ianuarius/60">·</span>
						<span>Calendario de eventos</span>
						<span className="text-ianuarius/60">·</span>
						<span>Gestión documental</span>
						<span className="text-ianuarius/60">·</span>
						<span>Inscripciones online</span>
					</div>

				</div>
			</section>

			{/* INFO SECTION */}
			<section className="bg-oscuro px-6 md:px-12 py-16 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
				<div className="lg:col-span-6 bg-gris p-5 md:p-6 rounded-xl border-t-4 border-ianuarius shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
					<div className="w-full h-48 bg-oscuro rounded-lg mb-5 overflow-hidden relative group">
						<img
							src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
							alt="Pista de atletismo"
							className="object-cover w-full h-full opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-700 ease-in-out"
						/>
					</div>
					<h3 className="text-xl md:text-2xl font-semibold text-white mb-3 leading-snug">Superar tus límites es posible, solo hay un paso...</h3>
					<p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">
						Ningún atleta en nuestra región entrena con la dedicación, las instalaciones y el seguimiento biométrico que ofrecemos en la disciplina de Ianuarius.
					</p>
					<a href="#" className="text-ianuarius hover:text-white text-sm font-semibold tracking-wide flex items-center gap-2 transition">
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
						<span className="text-ianuarius text-xl transform group-hover:translate-x-2 transition">&rarr;</span>
					</a>
				</div>
			</section>

			{/* FOOTER */}
			<footer className="w-full py-8 flex justify-center border-t border-white/5">
				<p className="text-[9px] text-gray-600 uppercase tracking-[0.5em] text-center leading-relaxed">
					Ianuarius Athletics Club &copy; 2026<br />
					<a href="?page=aviso-legal" className="hover:text-gray-400 transition underline underline-offset-2">Aviso Legal</a>
				</p>
			</footer>

			{/* BANNER COOKIES */}
			{!cookiesAceptadas && (
				<div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
					<div className="max-w-3xl mx-auto bg-gris border border-white/10 border-t-2 border-t-ianuarius rounded-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
						<div className="flex-1">
							<p className="text-white text-xs font-bold uppercase tracking-widest mb-2">Uso de cookies</p>
							<p className="text-gray-400 text-xs leading-relaxed">
								Esta aplicación utiliza únicamente las cookies estrictamente necesarias para su funcionamiento.
								Concretamente, una <span className="text-white">cookie de sesión</span> (<code className="text-ianuarius text-[11px]">PHPSESSID</code>) que
								identifica tu sesión iniciada y te mantiene autenticado mientras usas la app.
								Se elimina automáticamente al cerrar el navegador. No se usan cookies de análisis, publicidad ni terceros.
							</p>
						</div>
						<button
							onClick={aceptarCookies}
							className="shrink-0 px-6 py-2.5 bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest rounded hover:bg-red-700 transition duration-300"
						>
							Aceptar
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
