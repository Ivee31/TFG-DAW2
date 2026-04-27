import { useState } from 'react';

// vista interna de marcas y registro
export default function Dashboard() {
    const [temporada, setTemporada] = useState('shortTrack');

    return (
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            
            {/* listado historial marcas */}
            <section className="lg:col-span-7 space-y-6">
                <div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Mis Marcas Recientes</h2>
                        <span className="text-[10px] bg-ianuarius/20 text-ianuarius px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">Temporada 2026</span>
                    </div>

                    {/* ¡¡¡ HARDCODEADO !!! */}
                    <div className="space-y-4">
                        <div className="group bg-oscuro/50 p-4 md:p-5 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-500 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
                            <div>
                                <h3 className="text-white font-bold text-base md:text-lg">400m Lisos (*HardCo*)</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Short Track / Pista Cubierta</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-ianuarius font-collegiate text-3xl md:text-2xl tracking-tighter font-mono">00'49''15</p>
                                <p className="text-[10px] md:text-[9px] text-gray-600 uppercase">12 Mar 2026</p>
                            </div>
                        </div>

                        <div className="group bg-oscuro/50 p-4 md:p-5 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-500 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
                            <div>
                                <h3 className="text-white font-bold text-base md:text-lg">400m Vallas (*HardCo*)</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Outdoor / Aire Libre</p>
                            </div>
                            <div className="sm:text-right">
                                <p className="text-ianuarius font-collegiate text-3xl md:text-2xl tracking-tighter font-mono">00'52''30</p>
                                <p className="text-[10px] md:text-[9px] text-gray-600 uppercase">04 Abr 2026</p>
                            </div>
                        </div>
                    </div>
                    {/* ¡¡¡ FIN HARDCODEADO !!! */}

                    <button className="w-full mt-6 md:mt-8 py-4 md:py-3 border border-dashed border-gray-700 text-gray-500 text-xs font-bold uppercase tracking-[0.3em] hover:text-white hover:border-white transition duration-300">
                        Ver historico
                    </button>
                </div>
            </section>

            {/* formulario nueva marca */}
            <aside className="lg:col-span-5">
                <div className="bg-gris p-6 md:p-8 rounded-2xl border-t-8 border-ianuarius shadow-2xl">
                    <h2 className="text-xl md:text-2xl font-extrabold mb-2 tracking-tight">Nueva Marca</h2>
                    <p className="text-gray-500 text-xs mb-6 md:mb-8 uppercase tracking-widest font-semibold">Guardar tiempo en bd</p>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-xs lg:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Prueba</label>
                            
                            {/* ¡¡¡ MODALIDADES HARDCODEADAS !!! */}
                            <select className="w-full bg-oscuro border border-white/10 p-4 md:p-3 rounded-lg text-sm focus:border-ianuarius outline-none transition appearance-none cursor-pointer">
                                <option>400m Lisos (*HardCo*)</option>
                                <option>400m Vallas (*HardCo*)</option>
                                <option>200m Lisos (*HardCo*)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs lg:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Temporada</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" 
                                        onClick={() => setTemporada('shortTrack')} 
                                        className={`py-3 md:py-2 text-xs lg:text-[10px] font-bold rounded uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${temporada === 'shortTrack' ? 'bg-ianuarius border border-transparent text-white shadow-[0_0_15px_rgba(254,0,0,0.4)]' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                    Short Track
                                </button>

                                <button type="button" 
                                        onClick={() => setTemporada('outdoor')} 
                                        className={`py-3 md:py-2 text-xs lg:text-[10px] font-bold rounded uppercase tracking-widest transition-all duration-300 transform hover:scale-[1.03] active:scale-95 ${temporada === 'outdoor' ? 'bg-ianuarius border border-transparent text-white shadow-[0_0_15px_rgba(254,0,0,0.4)]' : 'bg-oscuro border border-white/10 text-gray-400 hover:bg-white/5'}`}>
                                    Outdoor
                                </button>

                            </div>
                        </div>

                        <div>
                            <label className="block text-xs lg:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Marca Final (MM'SS''ms)</label>
                            <input type="text" placeholder="00'00''00" className="w-full bg-oscuro border border-white/10 p-5 md:p-4 rounded-lg text-2xl text-ianuarius focus:border-ianuarius outline-none transition font-mono" />
                        </div>

                        <button type="submit" className="w-full bg-white text-oscuro font-black py-5 md:py-4 rounded-xl text-sm lg:text-xs uppercase tracking-[0.3em] hover:bg-ianuarius hover:text-white transition duration-500 shadow-[0_5px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_5px_20px_rgba(254,0,0,0.4)]">
                            Guardar Registro
                        </button>

                    </form>

                </div>
            </aside>
            
        </main>
    );
}