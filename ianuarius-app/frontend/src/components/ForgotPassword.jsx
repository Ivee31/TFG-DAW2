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
			<div style={{ padding: '24px', background: '#262626', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '4px 4px 0 #FE0000', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center' }}>
				<p className="text-white font-black text-sm uppercase tracking-widest">Revisa tu email</p>
				<p className="text-gray-400 text-xs leading-relaxed">
					Si el email está registrado, recibirás un enlace para restablecer tu contraseña. Válido 1 hora.
				</p>
				<div className="bg-yellow-500/10 border border-yellow-500/40 rounded px-3 py-2">
					<p className="text-yellow-400 text-[10px] leading-relaxed">⚠ Si no aparece en bandeja de entrada, revisa la carpeta de <strong>spam o correo no deseado</strong>.</p>
				</div>
				<button onClick={onBack} className="text-gray-400 hover:text-white text-xs uppercase tracking-widest transition">
					← Volver al login
				</button>
			</div>
		);
	}

	return (
		<div style={{ padding: '24px', background: '#262626', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '4px 4px 0 #FE0000', display: 'flex', flexDirection: 'column', gap: '14px' }}>
			<div>
				<p className="text-white font-black text-xl tracking-widest text-center">RECUPERAR</p>
				<p className="text-gray-400 text-[10px] text-center uppercase tracking-widest mt-1">Contraseña olvidada</p>
			</div>
			<div className="bg-yellow-500/10 border border-yellow-500/40 rounded px-3 py-2">
				<p className="text-yellow-400 text-[10px] leading-relaxed">⚠ El email puede llegar a <strong>spam</strong>. Revísalo si no aparece en bandeja de entrada.</p>
			</div>
			{errorMsg && (
				<div style={{ background: 'rgba(254,0,0,0.1)', border: '1px solid #FE0000', color: '#FE0000', padding: '8px', borderRadius: '5px', fontSize: '12px', textAlign: 'center' }}>
					{errorMsg}
				</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label htmlFor="forgot-email" className="block text-gray-400 mb-1 text-xs">Email</label>
					<input
						id="forgot-email"
						type="email"
						placeholder="tu@email.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						style={{ width: '100%', height: '38px', borderRadius: '5px', border: '2px solid #4B5563', backgroundColor: '#171717', boxShadow: '3px 3px 0 #374151', fontSize: '13px', fontWeight: 600, color: '#fff', padding: '5px 10px', outline: 'none' }}
						className="neo-input"
					/>
				</div>
				<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white label-caps py-2 rounded border-2 border-[#FE0000] shadow-[4px_4px_0_#7f1212] neo-press disabled:opacity-50 disabled:cursor-not-allowed">
					{loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
				</button>
			</form>
			<button onClick={onBack} className="text-gray-400 hover:text-white text-[10px] uppercase tracking-widest transition text-center">
				← Volver al login
			</button>
		</div>
	);
}
