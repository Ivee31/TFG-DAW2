import { useState } from 'react';
import { API } from '../api';
import logoIanuarius from '../assets/logoIanuarius.png';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:ring-2 focus:ring-ianuarius/40 text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

export default function CompleteGoogleProfile({ data, onSuccess, onCancel }) {
	const [form, setForm] = useState({ dni: '', fecha_nacimiento: '', genero: '', rol: 'Atleta' });
	const [errorMsg, setErrorMsg] = useState('');
	const [pendingMsg, setPendingMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = (e) => {
		e.preventDefault();
		setErrorMsg('');
		const partes = form.fecha_nacimiento.split('/');
		if (partes.length !== 3 || partes[2].length !== 4) { setErrorMsg('Fecha inválida. Usa el formato DD/MM/YYYY'); return; }
		const fechaISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
		setLoading(true);

		fetch(`${API}/google-complete`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ dni: form.dni, fecha_nacimiento: fechaISO, genero: form.genero, rol: form.rol })
		})
		.then(res => res.json())
		.then(d => {
			setLoading(false);
			if (d.status === 'success') onSuccess(d.user);
			else if (d.status === 'pending') setPendingMsg(d.message);
			else setErrorMsg(d.error || 'Error al completar el registro');
		})
		.catch(() => { setLoading(false); setErrorMsg('Error de conexion'); });
	};

	if (pendingMsg) {
		return (
			<div className="bg-oscuro min-h-screen flex items-center justify-center px-4">
				<div className="w-full max-w-sm bg-gris p-8 rounded-xl border-t-4 border-yellow-500 shadow-2xl text-center">
					<p className="text-yellow-400 font-bold text-sm mb-2">Registro completado</p>
					<p className="text-gray-400 text-xs leading-relaxed mb-5">{pendingMsg}</p>
					<button onClick={onCancel} className="text-gray-500 hover:text-white text-xs uppercase tracking-widest transition">Volver al inicio</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-oscuro min-h-screen flex items-center justify-center px-4">
			<div className="w-full max-w-sm">
				<div className="flex justify-center mb-8">
					<div className="w-16 h-16 bg-oscuro border-2 border-ianuarius/50 rounded-full flex items-center justify-center p-2 shadow-[0_0_30px_rgba(254,0,0,0.3)]">
						<img src={logoIanuarius} alt="Ianuarius" className="w-full h-full object-contain" />
					</div>
				</div>
				<div className="bg-gris p-8 rounded-xl border-t-4 border-ianuarius shadow-2xl">
					<h2 className="text-xl font-black text-white mb-1 text-center tracking-widest">COMPLETAR PERFIL</h2>
					<p className="text-gray-500 text-[10px] text-center uppercase tracking-widest mb-1">Registro con Google</p>
					<p className="text-gray-400 text-[10px] text-center mb-6">Necesitamos algunos datos adicionales para el club</p>
					{errorMsg && (
						<div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
							{errorMsg}
						</div>
					)}
					<div className="space-y-2 mb-5 bg-oscuro/40 rounded-lg p-3">
						<p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Datos de Google</p>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<p className="text-[10px] text-gray-500">Nombre</p>
								<p className="text-white text-xs">{data.nombre}</p>
							</div>
							<div>
								<p className="text-[10px] text-gray-500">Apellidos</p>
								<p className="text-white text-xs">{data.apellidos || '—'}</p>
							</div>
						</div>
						<div>
							<p className="text-[10px] text-gray-500">Email</p>
							<p className="text-ianuarius text-xs">{data.email}</p>
						</div>
					</div>
					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label htmlFor="cgp-dni" className={labelClasses}>DNI</label>
								<input id="cgp-dni" type="text" name="dni" className={inputClasses} placeholder="12345678A" maxLength={9} value={form.dni} onChange={handleChange} required />
							</div>
							<div>
								<label htmlFor="cgp-rol" className={labelClasses}>Rol</label>
								<select id="cgp-rol" name="rol" className={inputClasses} value={form.rol} onChange={handleChange} required>
									<option value="Atleta">Atleta</option>
									<option value="Entrenador">Entrenador</option>
								</select>
							</div>
						</div>
						{form.rol === 'Entrenador' && (
							<p className="text-yellow-500/80 text-[10px] bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2">
								Las cuentas de Entrenador requieren activación por un administrador.
							</p>
						)}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label htmlFor="cgp-fecha" className={labelClasses}>Fecha nacimiento</label>
								<input id="cgp-fecha" type="text" name="fecha_nacimiento" className={inputClasses} placeholder="DD/MM/YYYY" maxLength={10} value={form.fecha_nacimiento} onChange={handleChange} required />
							</div>
							<div>
								<label htmlFor="cgp-genero" className={labelClasses}>Género</label>
								<select id="cgp-genero" name="genero" className={inputClasses} value={form.genero} onChange={handleChange} required>
									<option value="" disabled>Seleccionar</option>
									<option value="M">Masculino</option>
									<option value="F">Femenino</option>
								</select>
							</div>
						</div>
						<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
							{loading ? 'REGISTRANDO...' : 'COMPLETAR REGISTRO'}
						</button>
					</form>
					<button onClick={onCancel} className="w-full mt-3 text-gray-400 hover:text-white text-[10px] uppercase tracking-widest transition">
						Cancelar
					</button>
				</div>
			</div>
		</div>
	);
}
