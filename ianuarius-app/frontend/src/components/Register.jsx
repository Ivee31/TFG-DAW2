import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API } from '../api';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:ring-2 focus:ring-ianuarius/40 text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

const GoogleIcon = () => (
	<svg viewBox="0 0 24 24" className="w-4 h-4">
		<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
		<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
		<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
		<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
	</svg>
);

export default function Register({ onRegisterSuccess, onGoogleNeedsCompletion }) {
	const [form, setForm] = useState({
		nombre: '', apellidos: '', dni: '', email: '',
		fecha_nacimiento: '', genero: '', rol: 'Atleta',
		password: '', confirm_password: ''
	});
	const [errorMsg, setErrorMsg] = useState('');
	const [pendingMsg, setPendingMsg] = useState('');
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleRegister = (e) => {
		e.preventDefault();
		setErrorMsg('');

		if (form.nombre.trim().length < 2) { setErrorMsg('El nombre debe tener al menos 2 caracteres'); return; }
		if (form.apellidos.trim().length < 2) { setErrorMsg('Los apellidos deben tener al menos 2 caracteres'); return; }
		if (!/^\d{8}[A-Za-z]$/.test(form.dni.trim())) { setErrorMsg('DNI no válido — formato: 8 dígitos y una letra (ej. 12345678A)'); return; }
		if (!form.fecha_nacimiento) { setErrorMsg('Fecha de nacimiento requerida'); return; }
		const yearNac = parseInt(form.fecha_nacimiento.split('-')[0], 10);
		const yearActual = new Date().getFullYear();
		if (yearNac < 1930 || yearNac > yearActual - 3) { setErrorMsg('Fecha de nacimiento no válida'); return; }
		if (form.password.length < 8) { setErrorMsg('La contraseña debe tener al menos 8 caracteres'); return; }
		if (!/[A-Z]/.test(form.password)) { setErrorMsg('La contraseña debe contener al menos una letra mayúscula'); return; }
		if (!/[!@#$%^&*()_+={}|;:,.?-]/.test(form.password)) { setErrorMsg('La contraseña debe contener al menos un carácter especial (ej. !, @, #, -, _)'); return; }
		if (form.password !== form.confirm_password) { setErrorMsg('Las contraseñas no coinciden'); return; }

		const fechaISO = form.fecha_nacimiento;
		setLoading(true);
		fetch(`${API}/register`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				nombre: form.nombre, apellidos: form.apellidos, dni: form.dni,
				email: form.email, fecha_nacimiento: fechaISO,
				genero: form.genero, rol: form.rol, password: form.password
			})
		})
		.then(res => res.json())
		.then(data => {
			setLoading(false);
			if (data.status === 'success') onRegisterSuccess(data.user);
			else if (data.status === 'pending') setPendingMsg(data.message);
			else setErrorMsg(data.error);
		})
		.catch(() => { setLoading(false); setErrorMsg('Error de conexión'); });
	};

	const googleLogin = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			fetch(`${API}/google-login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ access_token: tokenResponse.access_token })
			})
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') onRegisterSuccess(data.user);
				else if (data.status === 'needs_completion') onGoogleNeedsCompletion(data.google_data);
				else setErrorMsg(data.error || 'Error con Google');
			})
			.catch(() => setErrorMsg('Error de conexion'));
		},
		onError: () => setErrorMsg('Error al registrarse con Google'),
	});

	if (pendingMsg) {
		return (
			<div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-yellow-500 w-full text-center">
				<p className="text-yellow-400 text-sm font-bold mb-2">Registro completado</p>
				<p className="text-gray-400 text-xs leading-relaxed">{pendingMsg}</p>
			</div>
		);
	}

	return (
		<div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
			<h2 className="text-2xl font-black text-white mb-4 text-center tracking-widest">REGISTRO</h2>
			{errorMsg && (
				<div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
					{errorMsg}
				</div>
			)}
			<button onClick={() => googleLogin()} className="w-full mb-1 border border-white/20 bg-white/5 text-white font-bold py-2 rounded hover:bg-white/10 transition duration-300 text-sm flex items-center justify-center gap-2">
				<GoogleIcon />
				Registrarse con Google
			</button>
			<p className="flex items-center justify-center gap-1 text-[9px] text-green-500/60 mb-3">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
					<path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
				</svg>
				Opción más segura
			</p>
			<div className="flex items-center gap-3 mb-4">
				<div className="flex-1 h-px bg-white/10"></div>
				<span className="text-gray-600 text-[10px] uppercase tracking-widest">o con email</span>
				<div className="flex-1 h-px bg-white/10"></div>
			</div>
			<form onSubmit={handleRegister} className="space-y-3">
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label htmlFor="reg-nombre" className={labelClasses}>Nombre</label>
						<input id="reg-nombre" type="text" name="nombre" className={inputClasses} placeholder="Juan" value={form.nombre} onChange={handleChange} required />
					</div>
					<div>
						<label htmlFor="reg-apellidos" className={labelClasses}>Apellidos</label>
						<input id="reg-apellidos" type="text" name="apellidos" className={inputClasses} placeholder="García López" value={form.apellidos} onChange={handleChange} required />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label htmlFor="reg-dni" className={labelClasses}>DNI</label>
						<input id="reg-dni" type="text" name="dni" className={inputClasses} placeholder="12345678A" maxLength={9} value={form.dni} onChange={handleChange} required />
					</div>
					<div>
						<label htmlFor="reg-rol" className={labelClasses}>Rol</label>
						<select id="reg-rol" name="rol" className={inputClasses} value={form.rol} onChange={handleChange} required>
							<option value="Atleta">Atleta</option>
							<option value="Entrenador">Entrenador</option>
						</select>
					</div>
				</div>
				{form.rol === 'Entrenador' && (
					<p className="text-yellow-500/80 text-[10px] bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2">
						Las cuentas de Entrenador requieren activación por un administrador antes de poder acceder.
					</p>
				)}
				<div>
					<label htmlFor="reg-email" className={labelClasses}>Email</label>
					<input id="reg-email" type="email" name="email" className={inputClasses} placeholder="atleta@ianuarius.com" value={form.email} onChange={handleChange} required />
				</div>
				<div className="grid grid-cols-2 gap-3 items-end">
					<div>
						<label htmlFor="reg-fecha" className={labelClasses}>Fecha de nacimiento</label>
						<input id="reg-fecha" type="date" name="fecha_nacimiento" className={inputClasses + " [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"} value={form.fecha_nacimiento} onChange={handleChange} required />
					</div>
					<div>
						<label htmlFor="reg-genero" className={labelClasses}>Género</label>
						<select id="reg-genero" name="genero" className={inputClasses} value={form.genero} onChange={handleChange} required>
							<option value="" disabled>Seleccionar</option>
							<option value="M">Masculino</option>
							<option value="F">Femenino</option>
						</select>
					</div>
				</div>
				<div>
					<label htmlFor="reg-password" className={labelClasses}>Contraseña</label>
					<input id="reg-password" type="password" name="password" className={inputClasses} placeholder="••••••••" value={form.password} onChange={handleChange} required />
				</div>
				<div>
					<label htmlFor="reg-confirm" className={labelClasses}>Confirmar contraseña</label>
					<input id="reg-confirm" type="password" name="confirm_password" className={inputClasses} placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required />
				</div>
				<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
					{loading && (
						<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					)}
					{loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
				</button>
			</form>
		</div>
	);
}
