import { useState, useEffect } from 'react';
import { API } from '../api';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

const TIPO_EVENTO_LABEL = {
    nacional:   'Nacional',
    autonomico: 'Autonómico CyL',
    provincial: 'Provincial',
    control:    'Control',
    escolares:  'Escolares',
};

const TIPO_PISTA_LABEL = {
    'aire libre':     'Aire Libre',
    'pista cubierta': 'Pista Cubierta',
    cross:            'Cross',
};

const TIPO_EVENTO_COLOR = {
    nacional:   'bg-red-500/20 text-red-300 border-red-500/30',
    autonomico: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    provincial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    control:    'bg-ianuarius/20 text-ianuarius border-ianuarius/30',
    escolares:  'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

function getDiasEnMes(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getPrimerDiaSemanaMes(year, month) {
    // 0=Lu, 6=Do
    const dia = new Date(year, month, 1).getDay();
    return (dia + 6) % 7;
}

const FORM_INICIAL = {
    titulo: '',
    descripcion: '',
    hora: '10:00',
    tipo_evento: 'control',
    tipo_pista: 'aire libre',
    id_categoria: '',
};

export default function Calendario({ user }) {
    const hoy = new Date();
    const [year, setYear]     = useState(hoy.getFullYear());
    const [month, setMonth]   = useState(hoy.getMonth());
    const [eventos, setEventos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [categorias, setCategorias] = useState([]);

    // modal añadir evento
    const [modalDia, setModalDia]     = useState(null);
    const [form, setForm]             = useState(FORM_INICIAL);
    const [guardando, setGuardando]   = useState(false);
    const [errorMsg, setErrorMsg]     = useState('');

    // detalle evento al hacer click
    const [eventoDetalle, setEventoDetalle] = useState(null);
    const [eliminando, setEliminando]       = useState(false);

    const puedeEditar = user?.rol === 'Entrenador' || user?.rol === 'Admin';

    const mesStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    const cargarEventos = () => {
        setCargando(true);
        fetch(`${API}/eventos?mes=${mesStr}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setEventos(d.eventos); })
            .finally(() => setCargando(false));
    };

    useEffect(() => { cargarEventos(); }, [year, month]);

    useEffect(() => {
        if (!puedeEditar) return;
        fetch(`${API}/categorias`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setCategorias(d.categorias); });
    }, [puedeEditar]);

    const irMesAnterior = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };

    const irMesSiguiente = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    const eventosPorDia = (dia) =>
        eventos.filter(e => {
            const f = new Date(e.fecha_hora + 'Z');
            return f.getDate() === dia && f.getMonth() === month && f.getFullYear() === year;
        });

    const abrirModal = (dia) => {
        setModalDia(dia);
        setForm(FORM_INICIAL);
        setErrorMsg('');
    };

    const cerrarModal = () => { setModalDia(null); setErrorMsg(''); };

    const handleGuardar = (e) => {
        e.preventDefault();
        if (!form.titulo.trim()) { setErrorMsg('El título es obligatorio'); return; }
        setGuardando(true);
        setErrorMsg('');

        const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(modalDia).padStart(2, '0')}`;
        const fecha_hora = `${fecha} ${form.hora}:00`;

        fetch(`${API}/eventos`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                fecha_hora,
                tipo_evento: form.tipo_evento,
                tipo_pista: form.tipo_pista,
                id_categoria: form.id_categoria,
            }),
        })
            .then(r => r.json())
            .then(d => {
                setGuardando(false);
                if (d.status === 'success') {
                    cerrarModal();
                    cargarEventos();
                } else {
                    setErrorMsg(d.error || 'Error al guardar');
                }
            })
            .catch(() => { setGuardando(false); setErrorMsg('Error de conexión'); });
    };

    const handleEliminar = (id_evento) => {
        setEliminando(true);
        fetch(`${API}/eventos/${id_evento}`, { method: 'DELETE', credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setEliminando(false);
                if (d.status === 'success') {
                    setEventoDetalle(null);
                    cargarEventos();
                }
            })
            .catch(() => setEliminando(false));
    };

    // construccion del grid
    const totalDias = getDiasEnMes(year, month);
    const primerDia = getPrimerDiaSemanaMes(year, month);
    const celdas = Array.from({ length: primerDia + totalDias }, (_, i) =>
        i < primerDia ? null : i - primerDia + 1
    );
    // rellenar hasta completar semana
    while (celdas.length % 7 !== 0) celdas.push(null);

    const esHoy = (dia) =>
        dia === hoy.getDate() && month === hoy.getMonth() && year === hoy.getFullYear();

    return (
        <div className="space-y-6">

            {/* cabecera mes */}
            <div className="flex items-center justify-between">
                <button
                    onClick={irMesAnterior}
                    className="p-2 text-gray-400 hover:text-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase">
                    {MESES[month]} <span className="text-ianuarius">{year}</span>
                </h2>

                <button
                    onClick={irMesSiguiente}
                    className="p-2 text-gray-400 hover:text-white transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* leyenda roles */}
            {puedeEditar && (
                <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center">
                    Pasa el cursor sobre un día para añadir un evento
                </p>
            )}

            {/* grid */}
            <div className="bg-gris/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">

                {/* cabecera días semana */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {DIAS_SEMANA.map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {d}
                        </div>
                    ))}
                </div>

                {/* celdas */}
                {cargando ? (
                    <div className="py-20 text-center text-gray-600 text-xs uppercase tracking-widest animate-pulse">
                        Cargando eventos...
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {celdas.map((dia, idx) => {
                            const evsDia = dia ? eventosPorDia(dia) : [];
                            return (
                                <div
                                    key={idx}
                                    className={`relative min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r border-white/5 group ${!dia ? 'bg-oscuro/20' : 'hover:bg-white/[0.02] transition'} ${dia && evsDia.length > 0 ? 'cursor-pointer' : ''}`}
                                    onClick={() => dia && evsDia.length > 0 && setEventoDetalle(evsDia[0])}
                                >
                                    {dia && (
                                        <>
                                            <span className={`text-[11px] font-bold inline-flex w-6 h-6 items-center justify-center rounded-full ${esHoy(dia) ? 'bg-ianuarius text-white' : 'text-gray-400'}`}>
                                                {dia}
                                            </span>

                                            {/* eventos del dia */}
                                            <div className="mt-1 space-y-0.5">
                                                {evsDia.slice(0, 2).map(ev => (
                                                    <div
                                                        key={ev.id_evento}
                                                        onClick={(e) => { e.stopPropagation(); setEventoDetalle(ev); }}
                                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border truncate cursor-pointer ${TIPO_EVENTO_COLOR[ev.tipo_evento] ?? 'bg-white/10 text-gray-300 border-white/10'}`}
                                                    >
                                                        {ev.titulo}
                                                    </div>
                                                ))}
                                                {evsDia.length > 2 && (
                                                    <div className="text-[9px] text-gray-500 pl-1.5">
                                                        +{evsDia.length - 2} más
                                                    </div>
                                                )}
                                            </div>

                                            {/* boton añadir — solo entrenador/admin en hover */}
                                            {puedeEditar && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); abrirModal(dia); }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-ianuarius rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                                                    title={`Añadir evento el día ${dia}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3 h-3 text-white">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* leyenda tipos */}
            <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(TIPO_EVENTO_LABEL).map(([key, label]) => (
                    <span key={key} className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${TIPO_EVENTO_COLOR[key]}`}>
                        {label}
                    </span>
                ))}
            </div>

            {/* modal añadir evento */}
            {modalDia && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={cerrarModal} />

                    <div className="relative bg-gris border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black uppercase tracking-widest text-sm">
                                Nuevo Evento — <span className="text-ianuarius">{String(modalDia).padStart(2, '0')} {MESES[month]}</span>
                            </h3>
                            <button onClick={cerrarModal} className="text-gray-500 hover:text-ianuarius transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg uppercase tracking-widest font-bold">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleGuardar} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Título *</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition"
                                    placeholder="Campeonato Provincial de Pista..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Descripción</label>
                                <textarea
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition resize-none h-20"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Hora</label>
                                <input
                                    type="time"
                                    value={form.hora}
                                    onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tipo de evento</label>
                                    <select
                                        value={form.tipo_evento}
                                        onChange={e => setForm(f => ({ ...f, tipo_evento: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition appearance-none cursor-pointer"
                                    >
                                        {Object.entries(TIPO_EVENTO_LABEL).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tipo de pista</label>
                                    <select
                                        value={form.tipo_pista}
                                        onChange={e => setForm(f => ({ ...f, tipo_pista: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition appearance-none cursor-pointer"
                                    >
                                        {Object.entries(TIPO_PISTA_LABEL).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Categoría</label>
                                <select
                                    value={form.id_categoria}
                                    onChange={e => setForm(f => ({ ...f, id_categoria: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm outline-none focus:border-ianuarius transition appearance-none cursor-pointer"
                                >
                                    <option value="">Todos</option>
                                    {categorias.map(c => (
                                        <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-white/10 text-gray-400 rounded-lg hover:bg-white/5 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-white text-oscuro rounded-lg hover:bg-ianuarius hover:text-white transition disabled:opacity-50"
                                >
                                    {guardando ? '...' : 'Guardar Evento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* modal detalle evento */}
            {eventoDetalle && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEventoDetalle(null)} />

                    <div className="relative bg-gris border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${TIPO_EVENTO_COLOR[eventoDetalle.tipo_evento] ?? 'bg-white/10 text-gray-300 border-white/10'}`}>
                                {TIPO_EVENTO_LABEL[eventoDetalle.tipo_evento]}
                            </span>
                            <button onClick={() => setEventoDetalle(null)} className="text-gray-500 hover:text-ianuarius transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-xl font-black tracking-tight mb-2">{eventoDetalle.titulo}</h3>

                        <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                            <p>
                                <span className="font-bold text-gray-300">Fecha: </span>
                                {new Date(eventoDetalle.fecha_hora).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p>
                                <span className="font-bold text-gray-300">Pista: </span>
                                {TIPO_PISTA_LABEL[eventoDetalle.tipo_pista]}
                            </p>
                            <p>
                                <span className="font-bold text-gray-300">Categoría: </span>
                                {eventoDetalle.categoria_nombre ?? 'Todos'}
                            </p>
                            {eventoDetalle.creado_por && (
                                <p>
                                    <span className="font-bold text-gray-300">Creado por: </span>
                                    {eventoDetalle.creado_por}
                                </p>
                            )}
                        </div>

                        {eventoDetalle.descripcion && (
                            <p className="text-sm text-gray-300 bg-oscuro/50 rounded-lg p-3 mb-4 leading-relaxed">
                                {eventoDetalle.descripcion}
                            </p>
                        )}

                        {puedeEditar && (
                            <button
                                onClick={() => handleEliminar(eventoDetalle.id_evento)}
                                disabled={eliminando}
                                className="w-full py-2.5 text-[10px] font-bold uppercase tracking-widest border border-ianuarius/40 text-ianuarius rounded-lg hover:bg-ianuarius hover:text-white transition disabled:opacity-50"
                            >
                                {eliminando ? '...' : 'Eliminar evento'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
