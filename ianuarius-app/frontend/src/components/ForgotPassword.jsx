import { useState } from 'react';
import { API } from '../api';

export default function ForgotPassword({ onBack }) {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [enviado, setEnviado] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		setErrorMsg('');
		setLoading(true);

		fetch(`${API}/forgot-password`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		})
		.then(res => res.json())
		.then(data => {
			setLoading(false);
			if (data.status === 'success') setEnviado(true);
			else setErrorMsg(data.error || 'Error al procesar la solicitud');
		})
		.catch(() => {
			setLoading(false);
			setErrorMsg('Error de conexion');
		});
	};

	if (enviado) {
		return (
			<div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full text-center">
				<p className="text-white font-black text-sm uppercase tracking-widest mb-3">Revisa tu email</p>
				<p className="text-gray-400 text-xs leading-relaxed mb-4">
					Si el email está registrado, recibirás un enlace para restablecer tu contraseña. Válido 1 hora.
				</p>
				<div className="bg-yellow-500/10 border border-yellow-500/40 rounded px-3 py-2 mb-5">
					<p className="text-yellow-400 text-[10px] leading-relaxed">⚠ Si no aparece en bandeja de entrada, revisa la carpeta de <strong>spam o correo no deseado</strong>.</p>
				</div>
				<button onClick={onBack} className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition">
					← Volver al login
				</button>
			</div>
		);
	}

	return (
		<div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
			<h2 className="text-xl font-black text-white mb-1 text-center tracking-widest">RECUPERAR</h2>
			<p className="text-gray-500 text-[10px] text-center uppercase tracking-widest mb-4">Contraseña olvidada</p>
			<div className="bg-yellow-500/10 border border-yellow-500/40 rounded px-3 py-2 mb-4">
				<p className="text-yellow-400 text-[10px] leading-relaxed">⚠ El email puede llegar a <strong>spam</strong>. Revísalo si no aparece en bandeja de entrada.</p>
			</div>
			{errorMsg && (
				<div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
					{errorMsg}
				</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-gray-400 mb-1 text-xs">Email</label>
					<input type="email" className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
				</div>
				<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
				</button>
			</form>
			<button onClick={onBack} className="w-full mt-3 text-gray-500 hover:text-white text-[10px] uppercase tracking-widest transition">
				← Volver al login
			</button>
		</div>
	);
}
