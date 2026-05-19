import { useState, useEffect, useRef } from 'react';
import { API } from '../api';
import { attachFocusTrap } from '../utils/focusTrap';

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
    fecha_fin: '',
    enlace: '',
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

    // detalle evento — { eventos: [], idx: 0 }
    const [detalleData, setDetalleData] = useState(null);
    const [eliminando, setEliminando]   = useState(false);

    const eventoActual = detalleData ? detalleData.eventos[detalleData.idx] : null;

    const modalAddRef     = useRef(null);
    const modalDetalleRef = useRef(null);

    // proximos eventos para el banner
    const [proximos, setProximos] = useState([]);

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
        fetch(`${API}/eventos/proximos?n=2`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setProximos(d.eventos); });
    }, []);

    useEffect(() => {
        if (!puedeEditar) return;
        fetch(`${API}/categorias/todas`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => { if (d.status === 'success') setCategorias(d.categorias); });
    }, [puedeEditar]);

    useEffect(() => {
        if (!modalDia || !modalAddRef.current) return;
        return attachFocusTrap(modalAddRef.current, cerrarModal);
    }, [!!modalDia]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!detalleData || !modalDetalleRef.current) return;
        return attachFocusTrap(modalDetalleRef.current, () => setDetalleData(null));
    }, [!!detalleData]); // eslint-disable-line react-hooks/exhaustive-deps

    const irMesAnterior = () => {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    };

    const irMesSiguiente = () => {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    };

    const eventosPorDia = (dia) => {
        const celdaTs = new Date(year, month, dia).getTime();
        return eventos.filter(e => {
            const inicio = new Date(e.fecha_hora.replace(' ', 'T'));
            const inicioTs = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
            if (e.fecha_fin) {
                const finTs = new Date(e.fecha_fin + 'T00:00:00').getTime();
                return celdaTs >= inicioTs && celdaTs <= finTs;
            }
            return inicioTs === celdaTs;
        });
    };

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
                fecha_fin: form.fecha_fin || null,
                enlace: form.enlace.trim() || null,
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
                    setDetalleData(null);
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

    const irAEvento = (ev) => {
        const f = new Date(ev.fecha_hora.replace(' ', 'T'));
        setYear(f.getFullYear());
        setMonth(f.getMonth());
        setDetalleData({ eventos: [ev], idx: 0 });
    };

    return (
        <div className="space-y-6">

            {/* banner proximos eventos */}
            {proximos.length > 0 && (
                <div className="bg-ianuarius/5 border border-ianuarius/20 rounded-xl p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-ianuarius shrink-0 mt-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <div className="grow">
                        <p className="text-ianuarius text-[10px] font-black uppercase tracking-widest mb-2">Próximos eventos</p>
                        <div className="flex flex-wrap gap-2">
                            {proximos.map(ev => {
                                const f = new Date(ev.fecha_hora.replace(' ', 'T'));
                                const fechaLabel = f.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                                return (
                                    <button
                                        key={ev.id_evento}
                                        onClick={() => irAEvento(ev)}
                                        className="text-[10px] bg-ianuarius/10 border border-ianuarius/25 text-gray-200 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider hover:bg-ianuarius/20 transition flex items-center gap-2"
                                    >
                                        <span className="text-ianuarius">{fechaLabel}</span>
                                        <span>{ev.titulo}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

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
                <>
                    <p className="md:hidden text-[10px] text-gray-400 uppercase tracking-widest text-center">
                        Pulsa <span className="text-ianuarius font-black">+</span> en un día para añadir un evento
                    </p>
                    <p className="hidden md:block text-[10px] text-gray-400 uppercase tracking-widest text-center">
                        Pasa el cursor sobre un día para añadir un evento
                    </p>
                </>
            )}

            {/* grid */}
            <div className="bg-gris/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">

                {/* cabecera días semana */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {DIAS_SEMANA.map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {d}
                        </div>
                    ))}
                </div>

                {/* celdas */}
                {cargando ? (
                    <div className="py-20 text-center text-gray-400 text-xs uppercase tracking-widest animate-pulse">
                        Cargando eventos...
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {celdas.map((dia, idx) => {
                            const evsDia = dia ? eventosPorDia(dia) : [];
                            return (
                                <div
                                    key={idx}
                                    className={`relative min-h-[88px] md:min-h-[100px] p-0.5 md:p-1.5 border-b border-r border-white/5 group ${!dia ? 'bg-oscuro/20' : 'hover:bg-white/[0.02] transition'} ${dia && evsDia.length > 0 ? 'cursor-pointer' : ''}`}
                                    onClick={() => dia && evsDia.length > 0 && setDetalleData({ eventos: evsDia, idx: 0 })}
                                >
                                    {dia && (
                                        <>
                                            <span className={`text-[10px] md:text-[11px] font-bold inline-flex w-5 h-5 md:w-6 md:h-6 items-center justify-center rounded-full ${esHoy(dia) ? 'bg-ianuarius text-white' : 'text-gray-400'}`}>
                                                {dia}
                                            </span>

                                            {/* eventos del dia */}
                                            <div className="mt-0.5 space-y-0.5">
                                                {evsDia.slice(0, 2).map(ev => (
                                                    <div
                                                        key={ev.id_evento}
                                                        onClick={(e) => { e.stopPropagation(); setDetalleData({ eventos: evsDia, idx: evsDia.indexOf(ev) }); }}
                                                        className={`text-[9px] font-bold px-1 md:px-1.5 py-0.5 rounded border truncate cursor-pointer ${TIPO_EVENTO_COLOR[ev.tipo_evento] ?? 'bg-white/10 text-gray-300 border-white/10'}`}
                                                    >
                                                        {ev.titulo}
                                                    </div>
                                                ))}
                                                {evsDia.length > 2 && (
                                                    <div className="text-[9px] text-gray-400 pl-1">
                                                        +{evsDia.length - 2}
                                                    </div>
                                                )}
                                            </div>

                                            {/* boton añadir — solo entrenador/admin en hover */}
                                            {puedeEditar && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); abrirModal(dia); }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-ianuarius rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
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

                    <div ref={modalAddRef} role="dialog" aria-modal="true" aria-label="Añadir evento" className="relative bg-gris border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black uppercase tracking-widest text-sm">
                                Nuevo Evento — <span className="text-ianuarius">{String(modalDia).padStart(2, '0')} {MESES[month]}</span>
                            </h3>
                            <button onClick={cerrarModal} className="text-gray-400 hover:text-ianuarius transition">
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
                                <label htmlFor="cal-titulo" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Título *</label>
                                <input
                                    id="cal-titulo"
                                    type="text"
                                    value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition"
                                    placeholder="Campeonato Provincial de Pista..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="cal-descripcion" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Descripción</label>
                                <textarea
                                    id="cal-descripcion"
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition resize-none h-20"
                                    placeholder="Detalles adicionales..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="cal-hora" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Hora inicio</label>
                                    <input
                                        id="cal-hora"
                                        type="time"
                                        value={form.hora}
                                        onChange={e => setForm(f => ({ ...f, hora: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="cal-fecha-fin" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Fecha fin <span className="text-gray-400 normal-case">(opcional)</span></label>
                                    <input
                                        id="cal-fecha-fin"
                                        type="date"
                                        value={form.fecha_fin}
                                        onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cal-enlace" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Enlace oficial <span className="text-gray-400 normal-case">(opcional)</span></label>
                                <input
                                    id="cal-enlace"
                                    type="url"
                                    value={form.enlace}
                                    onChange={e => setForm(f => ({ ...f, enlace: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="cal-tipo-evento" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tipo de evento</label>
                                    <select
                                        id="cal-tipo-evento"
                                        value={form.tipo_evento}
                                        onChange={e => setForm(f => ({ ...f, tipo_evento: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition appearance-none cursor-pointer"
                                    >
                                        {Object.entries(TIPO_EVENTO_LABEL).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="cal-tipo-pista" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Tipo de pista</label>
                                    <select
                                        id="cal-tipo-pista"
                                        value={form.tipo_pista}
                                        onChange={e => setForm(f => ({ ...f, tipo_pista: e.target.value }))}
                                        className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition appearance-none cursor-pointer"
                                    >
                                        {Object.entries(TIPO_PISTA_LABEL).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="cal-categoria" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Categoría</label>
                                <select
                                    id="cal-categoria"
                                    value={form.id_categoria}
                                    onChange={e => setForm(f => ({ ...f, id_categoria: e.target.value }))}
                                    className="w-full bg-oscuro border border-white/10 p-3 rounded-lg text-sm focus:ring-2 focus:ring-ianuarius/40 focus:border-ianuarius transition appearance-none cursor-pointer"
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
            {eventoActual && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetalleData(null); }} />

                    <div ref={modalDetalleRef} role="dialog" aria-modal="true" aria-label={eventoActual.titulo} className="relative bg-gris border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${TIPO_EVENTO_COLOR[eventoActual.tipo_evento] ?? 'bg-white/10 text-gray-300 border-white/10'}`}>
                                {TIPO_EVENTO_LABEL[eventoActual.tipo_evento]}
                            </span>
                            <button onClick={() => setDetalleData(null)} aria-label="Cerrar detalle de evento" className="text-gray-400 hover:text-ianuarius transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <h3 className="text-xl font-black tracking-tight mb-2">{eventoActual.titulo}</h3>

                        <div className="space-y-1.5 text-xs text-gray-400 mb-4">
                            <p>
                                <span className="font-bold text-gray-300">Inicio: </span>
                                {new Date(eventoActual.fecha_hora).toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {eventoActual.fecha_fin && (
                                <p>
                                    <span className="font-bold text-gray-300">Fin: </span>
                                    {new Date(eventoActual.fecha_fin + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                            <p>
                                <span className="font-bold text-gray-300">Pista: </span>
                                {TIPO_PISTA_LABEL[eventoActual.tipo_pista]}
                            </p>
                            <p>
                                <span className="font-bold text-gray-300">Categoría: </span>
                                {eventoActual.categoria_nombre ?? 'Todos'}
                            </p>
                            {eventoActual.creado_por && (
                                <p>
                                    <span className="font-bold text-gray-300">Creado por: </span>
                                    {eventoActual.creado_por}
                                </p>
                            )}
                        </div>

                        {eventoActual.enlace && (
                            <a
                                href={eventoActual.enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs text-ianuarius hover:text-white transition mb-4 border border-ianuarius/30 rounded-lg px-3 py-2 hover:bg-ianuarius/10"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                </svg>
                                <span className="truncate font-bold uppercase tracking-widest">Ver horario oficial</span>
                            </a>
                        )}

                        {eventoActual.descripcion && (
                            <p className="text-sm text-gray-300 bg-oscuro/50 rounded-lg p-3 mb-4 leading-relaxed">
                                {eventoActual.descripcion}
                            </p>
                        )}

                        {detalleData.eventos.length > 1 && (
                            <div className="flex items-center justify-between mb-4 border-t border-white/5 pt-4">
                                <button
                                    onClick={() => setDetalleData(d => ({ ...d, idx: d.idx - 1 }))}
                                    disabled={detalleData.idx === 0}
                                    aria-label="Evento anterior"
                                    className="p-2 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                                    </svg>
                                </button>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                                    {detalleData.idx + 1} / {detalleData.eventos.length}
                                </span>
                                <button
                                    onClick={() => setDetalleData(d => ({ ...d, idx: d.idx + 1 }))}
                                    disabled={detalleData.idx === detalleData.eventos.length - 1}
                                    aria-label="Evento siguiente"
                                    className="p-2 text-gray-400 hover:text-white transition disabled:opacity-25 disabled:cursor-not-allowed"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {puedeEditar && (
                            <button
                                onClick={() => handleEliminar(eventoActual.id_evento)}
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
