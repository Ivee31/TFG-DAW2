import { useState, useEffect, useRef } from 'react';
import { API } from '../api';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

const resizeToBase64 = (file) => new Promise((resolve, reject) => {
	const img = new Image();
	const url = URL.createObjectURL(file);
	img.onload = () => {
		const MAX = 300;
		const scale = Math.min(MAX / img.width, MAX / img.height, 1);
		const canvas = document.createElement('canvas');
		canvas.width = Math.round(img.width * scale);
		canvas.height = Math.round(img.height * scale);
		canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
		URL.revokeObjectURL(url);
		resolve(canvas.toDataURL('image/jpeg', 0.85));
	};
	img.onerror = reject;
	img.src = url;
});

function Avatar({ src, nombre, apellidos, onEdit }) {
	const [hovered, setHovered] = useState(false);
	const fileRef = useRef(null);
	const initials = ((nombre?.[0] || '') + (apellidos?.[0] || '')).toUpperCase();

	return (
		<>
			<div
				className="relative w-20 h-20 rounded-full cursor-pointer shrink-0 shadow-lg overflow-hidden"
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				onClick={() => fileRef.current?.click()}
				title="Cambiar foto de perfil"
			>
				{src ? (
					<img src={src} alt="Foto de perfil" className="w-full h-full object-cover" />
				) : (
					<div className="w-full h-full bg-ianuarius flex items-center justify-center">
						<span className="text-white font-black text-2xl tracking-widest">{initials}</span>
					</div>
				)}

				<div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-white">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
					</svg>
					<span className="text-white text-[9px] font-bold uppercase tracking-wider">Editar</span>
				</div>
			</div>

			<input
				ref={fileRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				className="hidden"
				onChange={e => { if (e.target.files[0]) onEdit(e.target.files[0]); e.target.value = ''; }}
			/>
		</>
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
	const [fotoLoading, setFotoLoading] = useState(false);

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

	const handleFotoChange = async (file) => {
		setFotoLoading(true);
		try {
			const base64 = await resizeToBase64(file);
			const res = await fetch(`${API}/usuarios/foto`, {
				method: 'PUT',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ foto: base64 })
			});
			const d = await res.json();
			if (d.status === 'success') onUserUpdate({ ...user, foto_perfil: base64 });
		} catch {}
		setFotoLoading(false);
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
				<div className="relative">
					<Avatar src={user.foto_perfil} nombre={user.nombre} apellidos={user.apellidos} onEdit={handleFotoChange} />
					{fotoLoading && (
						<div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
							<svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
						</div>
					)}
				</div>

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
