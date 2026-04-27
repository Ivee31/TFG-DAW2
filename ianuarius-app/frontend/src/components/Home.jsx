/**
 * vista Home
 */
import { useState } from "react";
import Login from './Login';
import logoIanuarius from '../assets/logoIanuarius.png';

export default function Home() {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <div className="bg-oscuro text-gray-200 font-sans antialiased overflow-x-hidden">
            <style>{
                `.bg-hero {
                    background: linear-gradient(to bottom, rgba(23, 23, 23, 0.7), rgba(23, 23, 23, 1)), url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') no-repeat center center;
                    background-size: cover;
                }
                
                .titulo-collegiate {
                    font-family: 'Graduate', sans-serif;
                    color: transparent; 
                    -webkit-text-stroke: 3px #FFFFFF; 
                }`
            }</style>

            <nav className="absolute top-0 w-full z-50 px-4 md:px-8 py-5 flex justify-between items-center text-[10px] md:text-xs tracking-widest uppercase">
                {/* nav Izq. */}
                <div className="flex items-center gap-5 relative">
                    <button onClick={() => setShowLogin(!showLogin)} className="bg-ianuarius text-white font-bold px-5 py-2 rounded-full shadow-[0_0_15px_rgba(254,0,0,0.4)] hover:bg-red-700 hover:shadow-[0_0_25px_rgba(254,0,0,0.6)] transition duration-300 flex items-center gap-2">
                        LogIn/ Registrarse <span className="text-base leading-none">&rarr;</span>
                    </button>
                    {/*Mostrar form login*/}
                    {showLogin && (
                        <div className="absolute left-0 top-full mt-4 w-72 md:w-80 z-50 origin-top-left">
                            <Login></Login>
                        </div>
                    )}

                    <div className="hidden lg:flex gap-4 text-white/60">
                        <a href="#" className="hover:text-ianuarius transition">IG</a>
                        <a href="#" className="hover:text-ianuarius transition">FB</a>
                        <a href="#" className="hover:text-ianuarius transition">TW</a>
                    </div>
                </div>

                <div className="absolute left-1/2 transform -translate-x-1/2 top-4">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-oscuro/60 backdrop-blur-md rounded-full border-2 border-ianuarius/50 flex items-center justify-center p-3 hover:border-ianuarius shadow-[0_0_30px_rgba(254,0,0,0.4)] transition duration-300">
                        <img src={logoIanuarius} alt="Escudo Ianuarius" className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="flex items-center gap-5 text-white/60">
                    <span className="hidden md:block hover:text-white cursor-pointer transition">ES / EN</span>
                    <button className="flex items-center gap-2.5 text-white hover:text-ianuarius transition group">
                        MENU
                        <div className="space-y-1">
                            <span className="block w-5 h-[1px] bg-white group-hover:bg-ianuarius transition"></span>
                            <span className="block w-5 h-[1px] bg-white group-hover:bg-ianuarius transition"></span>
                        </div>
                    </button>
                </div>
            </nav>

            <section className="h-[85vh] w-full bg-hero flex flex-col justify-center items-center relative">
                <h1 className="titulo-collegiate text-5xl md:text-7xl lg:text-[8rem] tracking-[0.1em] md:tracking-[0.15em] z-10 select-none ml-4 md:ml-12 drop-shadow-[0_0_30px_rgba(254,0,0,0.2)]">
                    IANUARIUS
                </h1>
                <p className="text-xs md:text-lg font-bold tracking-[0.4em] md:tracking-[0.8em] text-ianuarius mt-4 z-10 ml-2 md:ml-6 drop-shadow-md">
                    A T L E T I S M O
                </p>
            </section>

            <section className="bg-oscuro px-6 md:px-12 pb-24 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 relative z-20">
                <div className="lg:col-span-6 bg-gris p-5 md:p-6 rounded-xl border-t-4 border-ianuarius transform -translate-y-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="w-full h-48 bg-[#171717] rounded-lg mb-5 overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Pista" className="object-cover w-full h-full opacity-60 group-hover:opacity-90 group-hover:scale-105 transition duration-700 ease-in-out" />
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