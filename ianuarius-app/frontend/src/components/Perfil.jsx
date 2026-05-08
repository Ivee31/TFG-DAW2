import { useState, useEffect } from 'react';
import { API } from '../api';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

function Avatar({ nombre, apellidos }) {
	const initials = ((nombre?.[0] || '') + (apellidos?.[0] || '')).toUpperCase();
	return (
		<div className="w-20 h-20 rounded-full bg-ianuarius flex items-center justify-center shrink-0 shadow-lg">
			<span className="text-white font-black text-2xl tracking-widest">{initials}</span>
		</div>
	);
}

function InfoRow({ label, value }) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
			<span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
			<span className="text-white text-sm">{value || '-'}</span>
		</div>
	);
}

function SectionHeader({ title, action }) {
	return (
		<div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
			<p className="text-[10px] uppercase tracking-widest text-gray-500">{title}</p>
			{action}
		</div>
	);
}

export default function Perfil({ user, onUserUpdate }) {
	const [editando, setEditando] = useState(false);
	const [form, setForm] = useState({
		nombre: user.nombre || '',
		apellidos: user.apellidos || '',
		genero: user.genero || '',
		fecha_nacimiento: user.fecha_nacimiento || ''
	});
	const [infoMsg, setInfoMsg] = useState('');
	const [infoLoading, setInfoLoading] = useState(false);

	const [showEmail, setShowEmail] = useState(false);
	const [nuevoEmail, setNuevoEmail] = useState('');
	const [emailMsg, setEmailMsg] = useState('');
	const [emailLoading, setEmailLoading] = useState(false);

	const [showPass, setShowPass] = useState(false);
	const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' });
	const [passMsg, setPassMsg] = useState('');
	const [passLoading, setPassLoading] = useState(false);

	const [categoria, setCategoria] = useState(null);

	useEffect(() => {
		fetch(`${API}/categorias`, { credentials: 'include' })
			.then(r => r.json())
			.then(d => {
				if (d.status === 'success' && d.categorias?.length > 0) {
					setCategoria(d.categorias[0].nombre);
				}
			})
			.catch(() => {});
	}, []);

	const handleInfoChange = e => setForm({ ...form, [e.target.name]: e.target.value });

	const cancelarEdicion = () => {
		setEditando(false);
		setInfoMsg('');
		setForm({
			nombre: user.nombre || '',
			apellidos: user.apellidos || '',
			genero: user.genero || '',
			fecha_nacimiento: user.fecha_nacimiento || ''
		});
	};

	const handleInfoSave = e => {
		e.preventDefault();
		setInfoLoading(true);
		setInfoMsg('');
		fetch(`${API}/usuarios/perfil`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(form)
		})
		.then(r => r.json())
		.then(d => {
			setInfoLoading(false);
			if (d.status === 'success') {
				setInfoMsg('Datos actualizados');
				setEditando(false);
				onUserUpdate({ ...user, ...form });
			} else {
				setInfoMsg(d.error || 'Error');
			}
		})
		.catch(() => { setInfoLoading(false); setInfoMsg('Error de conexión'); });
	};

	const handleEmailChange = e => {
		e.preventDefault();
		setEmailLoading(true);
		setEmailMsg('');
		fetch(`${API}/usuarios/email`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: nuevoEmail })
		})
		.then(r => r.json())
		.then(d => {
			setEmailLoading(false);
			if (d.status === 'success') {
				setEmailMsg('Email actualizado');
				onUserUpdate({ ...user, email: d.email });
				setNuevoEmail('');
				setTimeout(() => { setShowEmail(false); setEmailMsg(''); }, 1500);
			} else {
				setEmailMsg(d.error || 'Error');
			}
		})
		.catch(() => { setEmailLoading(false); setEmailMsg('Error de conexión'); });
	};

	const handlePassChange = e => {
		e.preventDefault();
		if (passForm.nueva !== passForm.confirmar) { setPassMsg('Las contraseñas no coinciden'); return; }
		setPassLoading(true);
		setPassMsg('');
		fetch(`${API}/usuarios/password`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password_actual: passForm.actual, nueva_password: passForm.nueva })
		})
		.then(r => r.json())
		.then(d => {
			setPassLoading(false);
			if (d.status === 'success') {
				setPassMsg('Contraseña actualizada');
				setPassForm({ actual: '', nueva: '', confirmar: '' });
				setTimeout(() => { setShowPass(false); setPassMsg(''); }, 1500);
			} else {
				setPassMsg(d.error || 'Error');
			}
		})
		.catch(() => { setPassLoading(false); setPassMsg('Error de conexión'); });
	};

	const generoLabel = g => g === 'M' ? 'Masculino' : g === 'F' ? 'Femenino' : '-';

	const fechaDisplay = f => {
		if (!f) return '-';
		const [y, m, d] = f.split('-');
		return `${d}/${m}/${y}`;
	};

	return (
		<div className="space-y-6 max-w-2xl">

			<div className="flex items-center gap-6 p-6 bg-gris rounded-lg border border-white/10">
				<Avatar nombre={user.nombre} apellidos={user.apellidos} />

				<div>
					<h2 className="text-2xl font-black text-white tracking-tight">{user.nombre} {user.apellidos}</h2>

					<span className="inline-block mt-2 px-3 py-1 bg-ianuarius/20 border border-ianuarius/40 text-ianuarius text-[10px] font-bold uppercase tracking-widest rounded-full">
						{user.rol}
					</span>
				</div>
			</div>

			<div className="bg-gris rounded-lg border border-white/10 overflow-hidden">
				<SectionHeader
					title="Información personal"
					action={
						!editando && (
							<button
								onClick={() => { setEditando(true); setInfoMsg(''); }}
								className="text-gray-400 hover:text-white transition"
								title="Editar información"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
								</svg>
							</button>
						)
					}
				/>

				{!editando ? (
					<div className="p-6 space-y-0">
						<InfoRow label="Nombre" value={user.nombre} />
						<InfoRow label="Apellidos" value={user.apellidos} />
						<InfoRow label="DNI" value={user.dni} />
						<InfoRow label="Fecha de nacimiento" value={fechaDisplay(user.fecha_nacimiento)} />
						<InfoRow label="Género" value={generoLabel(user.genero)} />
						{categoria && <InfoRow label="Categoría" value={categoria} />}
					</div>
				) : (
					<form onSubmit={handleInfoSave} className="p-6 space-y-4">
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClasses}>Nombre</label>
								<input type="text" name="nombre" className={inputClasses} value={form.nombre} onChange={handleInfoChange} required />
							</div>

							<div>
								<label className={labelClasses}>Apellidos</label>
								<input type="text" name="apellidos" className={inputClasses} value={form.apellidos} onChange={handleInfoChange} required />
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClasses}>Fecha de nacimiento</label>
								<input type="date" name="fecha_nacimiento" className={inputClasses + " [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"} value={form.fecha_nacimiento} onChange={handleInfoChange} required />
							</div>

							<div>
								<label className={labelClasses}>Género</label>
								<select name="genero" className={inputClasses} value={form.genero} onChange={handleInfoChange} required>
									<option value="M">Masculino</option>
									<option value="F">Femenino</option>
								</select>
							</div>
						</div>

						{infoMsg && (
							<p className={`text-xs text-center ${infoMsg === 'Datos actualizados' ? 'text-green-400' : 'text-red-400'}`}>{infoMsg}</p>
						)}

						<div className="flex gap-3">
							<button type="submit" disabled={infoLoading} className="flex-1 bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
								{infoLoading ? 'Guardando...' : 'Guardar cambios'}
							</button>

							<button type="button" onClick={cancelarEdicion} className="flex-1 border border-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest py-2 rounded hover:text-white hover:border-white/30 transition">
								Cancelar
							</button>
						</div>
					</form>
				)}
			</div>

			<div className="bg-gris rounded-lg border border-white/10 overflow-hidden">
				<SectionHeader
					title="Correo electrónico"
					action={
						<button
							onClick={() => { setShowEmail(v => !v); setEmailMsg(''); setNuevoEmail(''); }}
							className="text-[10px] font-bold uppercase tracking-widest text-ianuarius hover:text-red-400 transition"
						>
							{showEmail ? 'Cancelar' : 'Cambiar'}
						</button>
					}
				/>

				<div className="p-6">
					<p className="text-white text-sm">{user.email}</p>

					{showEmail && (
						<form onSubmit={handleEmailChange} className="mt-4 space-y-3">
							<div>
								<label className={labelClasses}>Nuevo email</label>
								<input type="email" className={inputClasses} value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} placeholder="nuevo@email.com" required />
							</div>

							{emailMsg && (
								<p className={`text-xs text-center ${emailMsg === 'Email actualizado' ? 'text-green-400' : 'text-red-400'}`}>{emailMsg}</p>
							)}

							<button type="submit" disabled={emailLoading} className="w-full bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
								{emailLoading ? 'Guardando...' : 'Confirmar cambio'}
							</button>
						</form>
					)}
				</div>
			</div>

			<div className="bg-gris rounded-lg border border-white/10 overflow-hidden">
				<SectionHeader
					title="Contraseña"
					action={
						<button
							onClick={() => { setShowPass(v => !v); setPassMsg(''); setPassForm({ actual: '', nueva: '', confirmar: '' }); }}
							className="text-[10px] font-bold uppercase tracking-widest text-ianuarius hover:text-red-400 transition"
						>
							{showPass ? 'Cancelar' : 'Cambiar'}
						</button>
					}
				/>

				<div className="p-6">
					<p className="text-gray-600 text-sm tracking-[0.3em]">••••••••••••</p>

					{showPass && (
						<form onSubmit={handlePassChange} className="mt-4 space-y-3">
							<div>
								<label className={labelClasses}>Contraseña actual</label>
								<input type="password" className={inputClasses} value={passForm.actual} onChange={e => setPassForm({ ...passForm, actual: e.target.value })} placeholder="••••••••" required />
							</div>

							<div>
								<label className={labelClasses}>Nueva contraseña</label>
								<input type="password" className={inputClasses} value={passForm.nueva} onChange={e => setPassForm({ ...passForm, nueva: e.target.value })} placeholder="••••••••" required />
							</div>

							<div>
								<label className={labelClasses}>Confirmar nueva contraseña</label>
								<input type="password" className={inputClasses} value={passForm.confirmar} onChange={e => setPassForm({ ...passForm, confirmar: e.target.value })} placeholder="••••••••" required />
							</div>

							{passMsg && (
								<p className={`text-xs text-center ${passMsg === 'Contraseña actualizada' ? 'text-green-400' : 'text-red-400'}`}>{passMsg}</p>
							)}

							<button type="submit" disabled={passLoading} className="w-full bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
								{passLoading ? 'Guardando...' : 'Confirmar cambio'}
							</button>
						</form>
					)}
				</div>
			</div>

		</div>
	);
}
