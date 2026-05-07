import { useState } from 'react';
import { API } from '../api';
import logoIanuarius from '../assets/logoIanuarius.png';

export default function ResetPassword({ token, onDone }) {
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [loading, setLoading] = useState(false);
	const [exito, setExito] = useState(false);
	const [errorMsg, setErrorMsg] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		setErrorMsg('');
		if (password !== confirm) { setErrorMsg('Las contraseñas no coinciden'); return; }
		if (password.length < 6) { setErrorMsg('La contraseña debe tener al menos 6 caracteres'); return; }
		setLoading(true);

		fetch(`${API}/reset-password`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ token, password })
		})
		.then(res => res.json())
		.then(data => {
			setLoading(false);
			if (data.status === 'success') setExito(true);
			else setErrorMsg(data.error || 'Error al restablecer la contraseña');
		})
		.catch(() => { setLoading(false); setErrorMsg('Error de conexion'); });
	};

	return (
		<div className="bg-oscuro min-h-screen flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<div className="flex justify-center mb-8">
					<div className="w-16 h-16 bg-oscuro border-2 border-ianuarius/50 rounded-full flex items-center justify-center p-2 shadow-[0_0_30px_rgba(254,0,0,0.3)]">
						<img src={logoIanuarius} alt="Ianuarius" className="w-full h-full object-contain" />
					</div>
				</div>
				{exito ? (
					<div className="bg-gris p-8 rounded-xl border-t-4 border-green-500 shadow-2xl text-center">
						<p className="text-white font-black text-sm uppercase tracking-widest mb-3">Contraseña actualizada</p>
						<p className="text-gray-400 text-xs leading-relaxed mb-6">Tu contraseña ha sido restablecida correctamente.</p>
						<button onClick={onDone} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition text-sm">
							Ir al inicio
						</button>
					</div>
				) : (
					<div className="bg-gris p-8 rounded-xl border-t-4 border-ianuarius shadow-2xl">
						<h2 className="text-xl font-black text-white mb-1 text-center tracking-widest">NUEVA CONTRASEÑA</h2>
						<p className="text-gray-500 text-[10px] text-center uppercase tracking-widest mb-6">Ianuarius Athletics</p>
						{errorMsg && (
							<div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
								{errorMsg}
							</div>
						)}
						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<label className="block text-gray-400 mb-1 text-xs">Nueva contraseña</label>
								<input type="password" className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
							</div>
							<div>
								<label className="block text-gray-400 mb-1 text-xs">Confirmar contraseña</label>
								<input type="password" className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
							</div>
							<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
								{loading ? 'GUARDANDO...' : 'RESTABLECER'}
							</button>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
