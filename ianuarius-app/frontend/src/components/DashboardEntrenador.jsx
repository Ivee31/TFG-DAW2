import { useState, useEffect } from 'react';
import { API } from '../api';

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

export default function DashboardEntrenador() {
    const [atletas,  setAtletas]  = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error,    setError]    = useState(null);

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

    return (
        <main>
            <div className="bg-gris/40 backdrop-blur-sm p-6 md:p-8 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <div>
                        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Atletas del Club</h2>
                        <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-semibold">
                            {cargando ? '...' : `${atletas.length} atletas activos`}
                        </p>
                    </div>
                    <span className="text-[10px] bg-ianuarius/20 text-ianuarius px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block">
                        Temporada 2026
                    </span>
                </div>

                {cargando && (
                    <p className="text-gray-500 text-xs uppercase tracking-widest text-center py-10">
                        Cargando atletas...
                    </p>
                )}

                {error && (
                    <p className="text-red-400 text-xs uppercase tracking-widest text-center py-10">
                        {error}
                    </p>
                )}

                {!cargando && !error && atletas.length === 0 && (
                    <p className="text-gray-600 text-xs uppercase tracking-widest text-center py-10 border border-dashed border-gray-700 rounded-xl">
                        No hay atletas registrados
                    </p>
                )}

                {!cargando && !error && atletas.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {atletas.map(a => (
                            <div key={a.id_usuario}
                                className="bg-oscuro/50 p-4 rounded-xl border border-transparent hover:border-ianuarius/50 transition duration-300">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-white font-bold text-sm truncate">
                                            {a.apellidos}, {a.nombre}
                                        </h3>
                                        <p className="text-gray-500 text-[10px] truncate mt-0.5">{a.email}</p>
                                    </div>
                                    <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-ianuarius/15 text-ianuarius px-2 py-0.5 rounded-full">
                                        {calcularCategoria(a.fecha_nacimiento, a.genero)}
                                    </span>
                                </div>
                                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">
                                        {a.genero === 'M' ? 'Masculino' : 'Femenino'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400">
                                        {a.total_marcas} {parseInt(a.total_marcas) === 1 ? 'marca' : 'marcas'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
