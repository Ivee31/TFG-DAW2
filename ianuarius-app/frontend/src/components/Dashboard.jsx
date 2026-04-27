import { useState } from 'react';

// vista principal del atleta logeado
export default function Dashboard({ user }) {
    // estados para formulario marcas
    const [prueba, setPrueba] = useState('400m lisos');
    const [temporada, setTemporada] = useState('Short Track');
    const [marca, setMarca] = useState('');

    // enviar peticion post para guardar marca
    const handleGuardarMarca = (e) => {
        e.preventDefault();
        
        // simulacion fetch hasta tener el endpoint php
        alert("Marca a guardar: " + marca + " en " + prueba);
    };

    return (
        <div className="min-h-screen bg-oscuro text-white p-6 md:p-12">
            
            {/* Cabecera dashboard */}
            <header className="mb-10 border-b-2 border-ianuarius pb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-widest text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>
                        PANEL DE ATLETA
                    </h1>
                    <p className="text-ianuarius font-bold tracking-widest mt-2">
                        {user ? `${user.nombre} ${user.apellidos}` : 'Atleta Desconocido'}
                    </p>
                </div>
                <button className="text-gray-400 hover:text-white text-sm transition">
                    Cerrar Sesion &rarr;
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Seccion listado marcas */}
                <div className="lg:col-span-7 bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius">
                    <h2 className="text-xl font-bold mb-6 text-gray-200">Mis Mejores Marcas</h2>
                    <ul className="space-y-4">
                        <li className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <div>
                                <p className="font-semibold text-white">400m lisos</p>
                                <p className="text-xs text-gray-400">Short Track</p>
                            </div>
                            <span className="text-ianuarius font-mono font-bold text-lg">00:49.15</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-gray-700 pb-3">
                            <div>
                                <p className="font-semibold text-white">400m vallas</p>
                                <p className="text-xs text-gray-400">Outdoor</p>
                            </div>
                            <span className="text-ianuarius font-mono font-bold text-lg">00:52.30</span>
                        </li>
                    </ul>
                </div>

                {/* Seccion formulario creacion */}
                <div className="lg:col-span-5 bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius">
                    <h2 className="text-xl font-bold mb-6 text-gray-200">Registrar Nueva Marca</h2>
                    <form onSubmit={handleGuardarMarca} className="space-y-5">
                        <div>
                            <label className="block text-gray-400 mb-1 text-xs">Disciplina</label>
                            <select 
                                className="w-full p-2.5 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm appearance-none"
                                value={prueba}
                                onChange={(e) => setPrueba(e.target.value)}
                            >
                                <option value="400m lisos">400m lisos</option>
                                <option value="400m vallas">400m vallas</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-gray-400 mb-1 text-xs">Temporada</label>
                            <select 
                                className="w-full p-2.5 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm appearance-none"
                                value={temporada}
                                onChange={(e) => setTemporada(e.target.value)}
                            >
                                <option value="Short Track">Short Track</option>
                                <option value="Outdoor">Outdoor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1 text-xs">Tiempo oficial (MM:SS.ms)</label>
                            <input 
                                type="text"
                                className="w-full p-2.5 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm font-mono"
                                placeholder="00:00.00"
                                value={marca}
                                onChange={(e) => setMarca(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="w-full bg-ianuarius text-white font-bold py-3 rounded hover:bg-red-700 transition duration-300 text-sm mt-4">
                            GUARDAR MARCA
                        </button>
                    </form>
                </div>
                
            </div>
        </div>
    );
}