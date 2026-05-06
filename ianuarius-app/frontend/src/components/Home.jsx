// vista Home
import { useState } from "react";
import Login from './Login';
import Register from './Register';
import logoIanuarius from '../assets/logoIanuarius.png';
import logoInstagram from '../assets/logoInstagram.png';

export default function Home({ onLoginSuccess }) {
	const [showLogin, setShowLogin] = useState(false);
	const [showRegister, setShowRegister] = useState(false);

	const toggleLogin = () => { setShowLogin(v => !v); setShowRegister(false); };
	const toggleRegister = () => { setShowRegister(v => !v); setShowLogin(false); };

	return (
		<div className="bg-oscuro text-gray-200 font-sans antialiased overflow-x-hidden">
			<style>{`
				.bg-hero {
					background: linear-gradient(to bottom, rgba(23, 23, 23, 0.7), rgba(23, 23, 23, 1)), url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') no-repeat center center;
					background-size: cover;
				}

				.titulo-collegiate {
					font-family: 'Graduate', sans-serif;
					color: transparent;
					-webkit-text-stroke: 3px #FFFFFF;
				}
			`}</style>

			<section className="min-h-[85vh] w-full bg-hero flex flex-col">
				<nav className="w-full px-4 md:px-8 py-4 grid grid-cols-3 items-center text-[10px] md:text-xs tracking-widest uppercase">
					{/* nav Izq. */}
					<div className="flex items-center gap-2 md:gap-4 relative">
						<button
							onClick={toggleRegister}
							className="hidden md:flex bg-ianuarius text-white font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(254,0,0,0.4)] hover:bg-red-700 hover:shadow-[0_0_25px_rgba(254,0,0,0.6)] transition duration-300 items-center gap-2 whitespace-nowrap"
						>
							Registrarse <span className="text-base leading-none">&rarr;</span>
						</button>
						<button
							onClick={toggleLogin}
							className="text-white hover:text-ianuarius transition duration-300 font-bold"
						>
							Login
						</button>
						<a
							href="https://www.instagram.com/c.a.i.s?igsh=N2Z2MXR2MGI3czI5"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-ianuarius transition"
						>
							<img src={logoInstagram} alt="Instagram" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
						</a>
						{showLogin && (
							<div className="absolute left-0 top-full mt-4 w-72 md:w-80 z-50 origin-top-left">
								<Login onLoginSuccess={onLoginSuccess} />
							</div>
						)}
						{showRegister && (
							<div className="absolute left-0 top-full mt-4 w-80 md:w-96 z-50 origin-top-left">
								<Register onRegisterSuccess={onLoginSuccess} />
							</div>
						)}
					</div>

					{/* Logo centrado */}
					<div className="flex justify-center">
						<div className="w-20 h-20 md:w-32 md:h-32 bg-oscuro/60 backdrop-blur-md rounded-full border-2 border-ianuarius/50 flex items-center justify-center p-2 md:p-3 hover:border-ianuarius shadow-[0_0_30px_rgba(254,0,0,0.4)] transition duration-300">
							<img src={logoIanuarius} alt="Escudo Ianuarius" className="w-full h-full object-contain" />
						</div>
					</div>

					{/* nav Der. */}
					<div className="flex items-center gap-2 md:gap-5 text-white/60 justify-end">
						<button
							onClick={toggleRegister}
							className="md:hidden bg-ianuarius text-white font-bold px-3 py-2 rounded-full shadow-[0_0_15px_rgba(254,0,0,0.4)] hover:bg-red-700 hover:shadow-[0_0_25px_rgba(254,0,0,0.6)] transition duration-300 flex items-center gap-1 whitespace-nowrap tracking-normal"
						>
							Reg <span className="text-sm leading-none">&rarr;</span>
						</button>
						<span className="hidden md:block hover:text-white cursor-pointer transition">ES / EN</span>
						<button className="flex items-center gap-2.5 text-white hover:text-ianuarius transition group">
							MENU
							<div className="space-y-1">
								<span className="block w-5 h-px bg-white group-hover:bg-ianuarius transition"></span>
								<span className="block w-5 h-px bg-white group-hover:bg-ianuarius transition"></span>
							</div>
						</button>
					</div>
				</nav>

				<div className="flex-1 flex flex-col justify-center items-center">
					<h1 className="titulo-collegiate text-5xl md:text-7xl lg:text-[8rem] tracking-widest md:tracking-[0.15em] select-none ml-4 md:ml-12 drop-shadow-[0_0_30px_rgba(254,0,0,0.2)]">
						IANUARIUS
					</h1>
					<p className="text-xs md:text-lg font-bold tracking-[0.4em] md:tracking-[0.8em] text-ianuarius mt-4 ml-2 md:ml-6 drop-shadow-md">
						A T L E T I S M O
					</p>
				</div>
			</section>

			<section className="bg-oscuro px-6 md:px-12 pb-24 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
				<div className="lg:col-span-6 bg-gris p-5 md:p-6 rounded-xl border-t-4 border-ianuarius transform -translate-y-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
					<div className="w-full h-48 bg-oscuro rounded-lg mb-5 overflow-hidden relative group">
						<img
							src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
							alt="Pista"
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

				<div className="lg:col-span-6 flex flex-col justify-center gap-8 lg:pr-8 pt-0 lg:pt-8">
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

		</div>
	);

}
