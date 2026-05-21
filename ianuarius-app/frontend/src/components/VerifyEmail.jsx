import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_URL;

export default function VerifyEmail({ token, onSuccess }) {
    const [estado, setEstado] = useState('verificando'); // verificando | ok | error | expirado

    useEffect(() => {
        fetch(`${API}/verify-email`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(r => r.json())
            .then(d => {
                if (d.status === 'success') setEstado('ok');
                else if (d.status === 'expired') setEstado('expirado');
                else setEstado('error');
            })
            .catch(() => setEstado('error'));
    }, [token]);

    return (
        <div className="min-h-screen bg-oscuro flex items-center justify-center p-4">
            <div className="w-full max-w-sm border-2 border-white/15 shadow-[4px_4px_0_#374151] rounded-lg bg-gris p-8 text-center space-y-4">
                <h2 className="font-graduate text-ianuarius text-xl tracking-widest uppercase">Ianuarius</h2>

                {estado === 'verificando' && (
                    <>
                        <p className="label-caps text-gray-400">Verificando tu email...</p>
                        <div className="flex justify-center pt-2">
                            <div className="anim-carga">
                                <div className="anim-carga__bola" />
                                <div className="anim-carga__bola" />
                            </div>
                        </div>
                    </>
                )}

                {estado === 'ok' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-green-400 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <p className="label-caps text-green-400">¡Email verificado!</p>
                        <p className="text-gray-400 text-sm">Tu cuenta está activa. Entrando...</p>
                        <button
                            onClick={onSuccess}
                            className="w-full label-caps py-3 rounded border-2 border-green-500/50 shadow-[3px_3px_0_#14532d] bg-green-500/10 text-green-400 neo-press transition"
                        >
                            Continuar
                        </button>
                    </>
                )}

                {estado === 'expirado' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-yellow-400 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <p className="label-caps text-yellow-400">Enlace expirado</p>
                        <p className="text-gray-400 text-sm">El enlace de verificación ha caducado (24h). Inicia sesión para solicitar uno nuevo.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full label-caps py-3 rounded border-2 border-[#4B5563] shadow-[3px_3px_0_#374151] bg-oscuro text-gray-300 neo-press transition"
                        >
                            Volver al inicio
                        </button>
                    </>
                )}

                {estado === 'error' && (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-red-400 mx-auto">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                        <p className="label-caps text-ianuarius">Enlace inválido</p>
                        <p className="text-gray-400 text-sm">El enlace no es válido o la cuenta ya fue verificada.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full label-caps py-3 rounded border-2 border-[#4B5563] shadow-[3px_3px_0_#374151] bg-oscuro text-gray-300 neo-press transition"
                        >
                            Volver al inicio
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
