import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API } from '../api';

const GoogleIcon = () => (
	<svg viewBox="0 0 24 24" width="20" height="20">
		<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
		<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
		<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
		<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
	</svg>
);

const card = {
	padding: '24px',
	background: '#262626',
	display: 'flex',
	flexDirection: 'column',
	gap: '14px',
	borderRadius: '8px',
	border: '2px solid rgba(255,255,255,0.15)',
	boxShadow: '4px 4px 0 #FE0000',
};

const inputStyle = {
	width: '100%',
	height: '38px',
	borderRadius: '5px',
	border: '2px solid #4B5563',
	backgroundColor: '#171717',
	boxShadow: '3px 3px 0 #374151',
	fontSize: '13px',
	fontWeight: 600,
	color: '#fff',
	padding: '5px 10px',
	outline: 'none',
};

const labelStyle = {
	display: 'block',
	color: '#9CA3AF',
	marginBottom: '4px',
	fontSize: '11px',
};

export default function Register({ onClose, onRegisterSuccess, onGoogleNeedsCompletion }) {
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

		setLoading(true);
		fetch(`${API}/register`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				nombre: form.nombre, apellidos: form.apellidos, dni: form.dni,
				email: form.email, fecha_nacimiento: form.fecha_nacimiento,
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
			<div style={{ ...card, borderColor: '#EAB308', boxShadow: '4px 4px 0 #713f12', textAlign: 'center' }}>
				<p style={{ color: '#EAB308', fontSize: '14px', fontWeight: 700 }}>Registro completado</p>
				<p style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: 1.6 }}>{pendingMsg}</p>
			</div>
		);
	}

	return (
		<div style={card}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
				<div>
					<div style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '0.05em' }}>
						Únete,
					</div>
					<div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: '14px' }}>
						crea tu cuenta para continuar
					</div>
				</div>
				<button
					onClick={onClose}
					aria-label="Cerrar"
					style={{
						width: '28px', height: '28px',
						borderRadius: '5px',
						border: '2px solid rgba(255,255,255,0.2)',
						backgroundColor: '#171717',
						boxShadow: '2px 2px 0 #374151',
						display: 'flex', alignItems: 'center', justifyContent: 'center',
						cursor: 'pointer', color: '#9CA3AF', flexShrink: 0,
					}}
					className="neo-press"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
						<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
					</svg>
				</button>
			</div>

			{errorMsg && (
				<div style={{ background: 'rgba(254,0,0,0.1)', border: '1px solid #FE0000', color: '#FE0000', padding: '8px', borderRadius: '5px', fontSize: '12px', textAlign: 'center' }}>
					{errorMsg}
				</div>
			)}

			<button
				onClick={() => googleLogin()}
				style={{
					width: '100%',
					height: '40px',
					borderRadius: '9999px',
					border: '2px solid #4B5563',
					backgroundColor: '#171717',
					boxShadow: '3px 3px 0 #374151',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: '10px',
					cursor: 'pointer',
					color: '#9CA3AF',
					fontSize: '13px',
					fontWeight: 600,
				}}
				className="neo-press"
			>
				<GoogleIcon />
				Registrarse con Google
			</button>

			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
				<span style={{ color: '#6B7280', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>o con email</span>
				<div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
			</div>

			<form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
					<div>
						<label style={labelStyle}>Nombre</label>
						<input type="text" name="nombre" placeholder="Juan" value={form.nombre} onChange={handleChange} required style={inputStyle} className="neo-input" />
					</div>
					<div>
						<label style={labelStyle}>Apellidos</label>
						<input type="text" name="apellidos" placeholder="García López" value={form.apellidos} onChange={handleChange} required style={inputStyle} className="neo-input" />
					</div>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
					<div>
						<label style={labelStyle}>DNI</label>
						<input type="text" name="dni" placeholder="12345678A" maxLength={9} value={form.dni} onChange={handleChange} required style={inputStyle} className="neo-input" />
					</div>
					<div>
						<label style={labelStyle}>Rol</label>
						<select name="rol" value={form.rol} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }} className="neo-input">
							<option value="Atleta">Atleta</option>
							<option value="Entrenador">Entrenador</option>
						</select>
					</div>
				</div>

				{form.rol === 'Entrenador' && (
					<p style={{ color: '#EAB308', fontSize: '10px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '5px', padding: '8px 12px', lineHeight: 1.5 }}>
						Las cuentas de Entrenador requieren activación por un administrador antes de poder acceder.
					</p>
				)}

				<div>
					<label style={labelStyle}>Email</label>
					<input type="email" name="email" placeholder="atleta@ianuarius.com" value={form.email} onChange={handleChange} required style={inputStyle} className="neo-input" />
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
					<div>
						<label style={labelStyle}>Fecha de nacimiento</label>
						<input
							type="date"
							name="fecha_nacimiento"
							value={form.fecha_nacimiento}
							onChange={handleChange}
							required
							style={{ ...inputStyle, colorScheme: 'dark' }}
							className="neo-input"
						/>
					</div>
					<div>
						<label style={labelStyle}>Género</label>
						<select name="genero" value={form.genero} onChange={handleChange} required style={{ ...inputStyle, cursor: 'pointer' }} className="neo-input">
							<option value="" disabled>Seleccionar</option>
							<option value="M">Masculino</option>
							<option value="F">Femenino</option>
						</select>
					</div>
				</div>

				<div>
					<label style={labelStyle}>Contraseña</label>
					<input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required style={inputStyle} className="neo-input" />
				</div>

				<div>
					<label style={labelStyle}>Confirmar contraseña</label>
					<input type="password" name="confirm_password" placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required style={inputStyle} className="neo-input" />
				</div>

				<button
					type="submit"
					disabled={loading}
					style={{
						marginTop: '6px',
						width: '100%',
						height: '40px',
						borderRadius: '5px',
						border: '2px solid #FE0000',
						backgroundColor: '#FE0000',
						boxShadow: loading ? 'none' : '4px 4px 0 #7f1212',
						fontSize: '14px',
						fontWeight: 700,
						color: '#fff',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
					}}
					className="neo-press"
				>
					{loading && (
						<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
					)}
					{loading ? 'REGISTRANDO...' : 'REGISTRARSE →'}
				</button>
			</form>
		</div>
	);
}
