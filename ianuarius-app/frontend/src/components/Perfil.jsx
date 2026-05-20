import { useState, useEffect, useRef, useMemo } from 'react';
import { API } from '../api';
import Tooltip from './Tooltip';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:ring-2 focus:ring-ianuarius/40 text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

const MARCAS_POR_PAG = 6;
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const resizeToBase64 = (file, max = 300) => new Promise((resolve, reject) => {
	const img = new Image();
	const url = URL.createObjectURL(file);
	img.onload = () => {
		const scale = Math.min(max / img.width, max / img.height, 1);
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

const fileToBase64 = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = reject;
	reader.readAsDataURL(file);
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
		<div className="flex items-center justify-between py-2 border-b border-white/15 last:border-0">
			<span className="text-gray-400 text-xs uppercase tracking-wider">{label}</span>
			<span className="text-white text-sm">{value || '-'}</span>
		</div>
	);
}

function SectionHeader({ title, action }) {
	return (
		<div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
			<p className="text-[10px] uppercase tracking-widest text-gray-400">{title}</p>
			{action}
		</div>
	);
}

function IconWarning() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-yellow-400 shrink-0">
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
		</svg>
	);
}

function IconCheck() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500 shrink-0">
			<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
		</svg>
	);
}

function IconDoc() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400 shrink-0">
			<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
		</svg>
	);
}

function extFromDataUri(src) {
	if (!src) return '';
	if (src.startsWith('data:application/pdf')) return '.pdf';
	if (src.startsWith('data:image/png'))  return '.png';
	if (src.startsWith('data:image/webp')) return '.webp';
	return '.jpg';
}

function FileCard({ label, subido, esInscripcion, previewSrc, formularioRellenado, onUpload, onDelete, accept, onGoToInscripcion, tooltip, downloadName }) {
	const fileRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState('');

	const handleFile = async (file) => {
		setLoading(true);
		setError('');
		try {
			await onUpload(file);
		} catch (e) {
			setError(e.message || 'Error al subir el archivo');
		}
		setLoading(false);
	};

	const handleDelete = async () => {
		setDeleting(true);
		setError('');
		try {
			await onDelete();
		} catch (e) {
			setError(e.message || 'Error al eliminar');
		}
		setDeleting(false);
	};

	const isPdf = previewSrc?.startsWith('data:application/pdf');

	return (
		<div className="border border-white/20 rounded-lg p-4 space-y-3">
			<div className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 min-w-0">
					<IconDoc />
					<span className="text-xs font-bold uppercase tracking-wider text-gray-300 truncate">{label}</span>
					{tooltip && <Tooltip text={tooltip} />}
				</div>
				{loading ? (
					<svg className="animate-spin w-4 h-4 text-gray-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
				) : subido ? <IconCheck /> : <IconWarning />}
			</div>


			{!loading && subido && (
				<>
					{previewSrc && !isPdf && (
						<div className="rounded overflow-hidden border border-white/20">
							<img src={previewSrc} alt={label} className="w-full h-28 object-cover object-center" />
						</div>
					)}
					{previewSrc && isPdf && (
						<div className="flex items-center gap-2 text-gray-400">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 shrink-0">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
							</svg>
							<span className="text-xs">PDF adjuntado</span>
						</div>
					)}
					{formularioRellenado && (
						<p className="text-[10px] uppercase tracking-widest font-bold text-green-500">Formulario completado</p>
					)}
					{!previewSrc && !formularioRellenado && (
						<p className="text-[10px] uppercase tracking-widest font-bold text-green-500">Adjuntado</p>
					)}
				</>
			)}

			{!loading && !subido && (
				<p className="text-[10px] uppercase tracking-widest font-bold text-yellow-400">Pendiente</p>
			)}

			{loading && (
				<p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 animate-pulse">Subiendo...</p>
			)}

			{error && <p className="text-[10px] text-red-400">{error}</p>}

			{onUpload && (
				<input
					ref={fileRef}
					type="file"
					accept={accept}
					className="hidden"
					onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
				/>
			)}

			<div className="flex gap-2 pt-1">
				<button
					disabled={loading || deleting || !onUpload}
					onClick={() => fileRef.current?.click()}
					className="flex-1 flex items-center justify-center gap-1 border border-white/20 text-gray-400 text-[9px] font-black uppercase tracking-widest py-2 rounded hover:text-white hover:border-white/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
						<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
					</svg>
					{esInscripcion ? 'Subir PDF' : 'Subir archivo'}
				</button>

				{subido && previewSrc && (
					<a
						href={previewSrc}
						download={(downloadName || label.toLowerCase().replace(/\s+/g, '_')) + extFromDataUri(previewSrc)}
						className="flex-1 flex items-center justify-center gap-1 border border-white/20 text-gray-400 text-[9px] font-black uppercase tracking-widest py-2 rounded hover:text-white hover:border-white/30 transition"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5 0-4.5 4.5M12 3v13.5m0 0 4.5-4.5" />
						</svg>
						Descargar
					</a>
				)}

				{esInscripcion && (
					<button
						className="flex-1 flex items-center justify-center gap-1 bg-ianuarius/10 border border-ianuarius/30 text-ianuarius text-[9px] font-black uppercase tracking-widest py-2 rounded hover:bg-ianuarius/20 transition"
						onClick={() => onGoToInscripcion?.()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
							<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
						</svg>
						Formulario
					</button>
				)}

				{subido && onDelete && (
					<button
						disabled={deleting || loading}
						onClick={handleDelete}
						aria-label={`Eliminar ${label}`}
						className="flex items-center justify-center gap-1 border border-red-900/40 text-red-500/60 text-[9px] font-black uppercase tracking-widest px-2 py-2 rounded hover:text-red-400 hover:border-red-500/40 transition disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{deleting ? (
							<svg className="animate-spin w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
								<path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
							</svg>
						)}
					</button>
				)}
			</div>
		</div>
	);
}

function MisArchivos({ user, onUserUpdate, onGoToInscripcion }) {
	const subirArchivo = async (endpoint, campo, file) => {
		const esImagen = file.type !== 'application/pdf';
		const max = campo === 'foto_dni' ? 800 : 400;
		const base64 = esImagen ? await resizeToBase64(file, max) : await fileToBase64(file);
		if (base64.length > 3000000) throw new Error('Archivo demasiado grande (máx. ~2,2 MB)');
		const res = await fetch(`${API}/usuarios/${endpoint}`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ foto: base64 })
		});
		const d = await res.json();
		if (d.status !== 'success') throw new Error(d.error || 'Error al guardar');
		onUserUpdate({ ...user, [campo]: base64 });
	};

	const eliminarArchivo = async (endpoint, campo) => {
		const res = await fetch(`${API}/usuarios/${endpoint}`, {
			method: 'DELETE',
			credentials: 'include'
		});
		const d = await res.json();
		if (d.status !== 'success') throw new Error(d.error || 'Error al eliminar');
		onUserUpdate({ ...user, [campo]: null });
	};

	const inscripcionCompleta = !!(user.inscripcion_pdf || user.inscripcion_formulario);

	return (
		<div className="bg-gris rounded-lg border border-white/20 overflow-hidden">
			<SectionHeader title="Mis archivos" />
			<div className="p-4 grid grid-cols-1 gap-3">
				<FileCard
					label="DNI escaneado"
					subido={!!user.foto_dni}
					previewSrc={user.foto_dni || null}
					downloadName="dni"
					onUpload={f => subirArchivo('dni', 'foto_dni', f)}
					onDelete={user.foto_dni ? () => eliminarArchivo('dni', 'foto_dni') : undefined}
					accept="image/jpeg,image/png,image/webp,application/pdf"
					tooltip="Foto o PDF de tu documento de identidad POR LAS DOS CARAS. Se usará junto con la ficha de inscripcion y tu foto de carnet."
				/>

				<FileCard
					label="Ficha de inscripción"
					subido={inscripcionCompleta}
					esInscripcion
					formularioRellenado={!!user.inscripcion_formulario}
					previewSrc={user.inscripcion_pdf || null}
					downloadName="inscripcion"
					onUpload={f => subirArchivo('inscripcion-pdf', 'inscripcion_pdf', f)}
					onDelete={user.inscripcion_pdf ? () => eliminarArchivo('inscripcion-pdf', 'inscripcion_pdf') : undefined}
					accept="application/pdf,image/jpeg,image/png,image/webp"
					onGoToInscripcion={onGoToInscripcion}
					tooltip="Formulario oficial de inscripción a la temporada, firmado. Sin él no podrás participar en competiciones o pertenecer al club oficialmente, ya q no te podremos federar."
				/>

				<FileCard
					label="Foto de carnet"
					subido={!!user.foto_carnet}
					previewSrc={user.foto_carnet || null}
					downloadName="carnet"
					onUpload={f => subirArchivo('carnet', 'foto_carnet', f)}
					onDelete={user.foto_carnet ? () => eliminarArchivo('carnet', 'foto_carnet') : undefined}
					accept="image/jpeg,image/png,image/webp"
					tooltip="Foto tipo carnet con fondo claro. Se usará en tu ficha oficial del club y en el listado de atletas para que l@s entrenador@s te reconozcan más facilmente."
				/>
			</div>
		</div>
	);
}

const FRECUENCIAS = [
	{ valor: 'muy_alta', label: 'Muy Alta', desc: '7, 5, 3 y 1 días antes', dias: [7, 5, 3, 1]},
	{ valor: 'alta', label: 'Alta', desc: '7 y 3 días antes', dias: [7, 3]},
	{ valor: 'baja', label: 'Baja', desc: 'Solo 7 días antes', dias: [7]},
];

function Notificaciones({ user, onUserUpdate }) {
	const [showModal, setShowModal]       = useState(false);
	const [loadingToggle, setLoadingToggle] = useState(false);
	const [loadingFreq, setLoadingFreq]   = useState(false);

	const activas    = user.notificaciones_email === 0 ? false : true;
	const frecuencia = user.frecuencia_notif || 'alta';

	const callApi = async (body, onSuccess) => {
		const res = await fetch(`${API}/usuarios/notificaciones`, {
			method: 'PUT',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const d = await res.json();
		if (d.status === 'success') onSuccess();
	};

	const toggle = async () => {
		setLoadingToggle(true);
		try {
			await callApi(
				{ activo: activas ? 0 : 1 },
				() => onUserUpdate({ ...user, notificaciones_email: activas ? 0 : 1 })
			);
		} catch {}
		setLoadingToggle(false);
		setShowModal(false);
	};

	const cambiarFrecuencia = async (val) => {
		if (val === frecuencia) return;
		setLoadingFreq(true);
		try {
			await callApi(
				{ frecuencia: val },
				() => onUserUpdate({ ...user, frecuencia_notif: val })
			);
		} catch {}
		setLoadingFreq(false);
	};

	const frecInfo = FRECUENCIAS.find(f => f.valor === frecuencia) ?? FRECUENCIAS[1];

	return (
		<>
			<div className="bg-gris rounded-lg border border-white/20 overflow-hidden">
				<SectionHeader title="Notificaciones" />
				<div className="p-6 space-y-5">

					{/* estado on/off */}
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className={`w-2.5 h-2.5 rounded-full shrink-0 ${activas ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} aria-hidden="true" />
							<p className="text-white text-sm">
								Avisos por correo:{' '}
								<span className={`font-bold ${activas ? 'text-green-400' : 'text-gray-500'}`}>
									{activas ? 'Activados' : 'Desactivados'}
								</span>
							</p>
						</div>

						{activas && (
							<p className="text-gray-400 text-xs leading-relaxed">
								Avisando <strong className="text-white">{frecInfo.desc}</strong>.
							</p>
						)}

						<button
							onClick={() => activas ? setShowModal(true) : toggle()}
							disabled={loadingToggle}
							className={`w-full py-2 label-caps rounded transition disabled:opacity-50 ${
								activas
									? 'border border-red-900/40 text-red-500/70 hover:text-red-400 hover:border-red-500/40'
									: 'bg-ianuarius/10 border border-ianuarius/30 text-ianuarius hover:bg-ianuarius/20'
							}`}
						>
							{loadingToggle ? '...' : activas ? 'Desactivar avisos' : 'Activar avisos'}
						</button>
					</div>

					{/* frecuencia */}
					{activas && (
						<div className="space-y-2 border-t border-white/20 pt-4">
							<p className="text-[10px] uppercase tracking-widest text-gray-400">Frecuencia de notificaciones</p>

							<div className="space-y-1.5" role="radiogroup" aria-label="Frecuencia de notificaciones por correo">
								{FRECUENCIAS.map(f => (
									<button
										key={f.valor}
										onClick={() => cambiarFrecuencia(f.valor)}
										disabled={loadingFreq}
										aria-pressed={frecuencia === f.valor}
										role="radio"
										aria-checked={frecuencia === f.valor}
										className={`w-full flex items-center justify-between px-3 py-2.5 rounded border text-left transition disabled:opacity-60 ${
											frecuencia === f.valor
												? 'border-ianuarius bg-ianuarius/10 text-white'
												: 'border-white/20 text-gray-400 hover:border-white/30 hover:text-white'
										}`}
									>
										<span className="label-caps">{f.label}</span>
										<span className="text-[9px] text-gray-400">{f.desc}</span>
									</button>
								))}
							</div>
						</div>
					)}

				</div>
			</div>

			{showModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
					onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false); }}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="modal-notif-titulo"
						className="bg-gris border border-white/20 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
					>
						<div className="flex items-start gap-3">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
							</svg>
							<div>
								<h3 id="modal-notif-titulo" className="text-white font-black text-sm uppercase tracking-widest mb-2">
									Desactivar avisos de correo
								</h3>
								<p className="text-gray-400 text-xs leading-relaxed">
									Si desactivas los avisos, <strong className="text-white">no recibirás recordatorios</strong> de competiciones próximas.
								</p>
								<p className="text-yellow-400/90 text-xs leading-relaxed mt-3 border border-yellow-400/20 rounded p-2 bg-yellow-400/5">
									<strong>Aviso importante:</strong> En caso de no presentarte a una competición inscrita, la multa por no presentarse será responsabilidad exclusiva del atleta.{' '}
									<strong>El club Ianuarius no se hará cargo en ningún caso</strong> de dicha sanción.
								</p>
							</div>
						</div>

						<div className="flex gap-3 pt-2">
							<button
								onClick={toggle}
								disabled={loadingToggle}
								className="flex-1 bg-red-700 text-white label-caps py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
							>
								{loadingToggle ? '...' : 'Confirmar — desactivar'}
							</button>
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 border border-white/20 text-gray-400 label-caps py-2 rounded hover:text-white hover:border-white/30 transition"
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}

export default function Perfil({ user, onUserUpdate, onNavigate }) {
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

	const [showDelete, setShowDelete] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [deleteMsg, setDeleteMsg] = useState('');

	const [marcasPerfil, setMarcasPerfil] = useState([]);
	const [cargandoMarcas, setCargandoMarcas] = useState(true);

	// filtros historial
	const [filterYear, setFilterYear]           = useState('');
	const [filterMonth, setFilterMonth]         = useState('');
	const [filterTemporada, setFilterTemporada] = useState('');
	const [marcaPage, setMarcaPage]             = useState(0);

	useEffect(() => { setMarcaPage(0); }, [filterYear, filterMonth, filterTemporada]);

	useEffect(() => {
		fetch(`${API}/marcas`, { credentials: 'include' })
			.then(r => r.json())
			.then(d => { if (d.status === 'success') setMarcasPerfil(d.marcas); })
			.finally(() => setCargandoMarcas(false));
	}, []);

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

	const yearsDisponibles = useMemo(() =>
		[...new Set(marcasPerfil.map(m => m.fecha?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a),
		[marcasPerfil]
	);

	const marcasFiltradas = useMemo(() => marcasPerfil.filter(m => {
		if (filterYear && m.fecha?.slice(0, 4) !== filterYear) return false;
		if (filterMonth && m.fecha?.slice(5, 7) !== filterMonth) return false;
		if (filterTemporada && m.temporada !== filterTemporada) return false;
		return true;
	}), [marcasPerfil, filterYear, filterMonth, filterTemporada]);

	const totalPaginas  = Math.max(1, Math.ceil(marcasFiltradas.length / MARCAS_POR_PAG));
	const marcasVisible = marcasFiltradas.slice(marcaPage * MARCAS_POR_PAG, (marcaPage + 1) * MARCAS_POR_PAG);

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

	const handleEliminarCuenta = async () => {
		setDeleteLoading(true);
		setDeleteMsg('');
		try {
			const res = await fetch(`${API}/usuarios/cuenta`, {
				method: 'DELETE',
				credentials: 'include'
			});
			const d = await res.json();
			if (d.status === 'success') {
				onUserUpdate(null);
			} else {
				setDeleteMsg(d.error || 'Error al eliminar la cuenta');
				setDeleteLoading(false);
			}
		} catch {
			setDeleteMsg('Error de conexión');
			setDeleteLoading(false);
		}
	};

	const generoLabel = g => g === 'M' ? 'Masculino' : g === 'F' ? 'Femenino' : '-';

	const formatFechaPerfil = (f) => {
		if (!f) return '';
		return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
	};

	const fechaDisplay = f => {
		if (!f) return '-';
		const [y, m, d] = f.split('-');
		return `${d}/${m}/${y}`;
	};

	return (
		<div className="space-y-6">

			{/* Grid principal */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

				{/* COLUMNA IZQUIERDA — historial marcas */}
				<div className="lg:col-span-5 flex flex-col gap-6">

					<div className="bg-gris rounded-lg border border-white/20 overflow-hidden flex flex-col flex-1">
						<SectionHeader title="Historial de marcas" />

						{/* filtros */}
						<div className="px-4 py-3 border-b border-white/20 space-y-2">
							<div className="flex gap-2">
								<select
									value={filterYear}
									onChange={e => setFilterYear(e.target.value)}
									aria-label="Filtrar por año"
									className="flex-1 bg-oscuro text-white text-[10px] border border-gray-700 rounded px-2 py-1.5 focus:border-ianuarius outline-none"
								>
									<option value="">Todos los años</option>
									{yearsDisponibles.map(y => <option key={y} value={y}>{y}</option>)}
								</select>

								<select
									value={filterMonth}
									onChange={e => setFilterMonth(e.target.value)}
									aria-label="Filtrar por mes"
									className="flex-1 bg-oscuro text-white text-[10px] border border-gray-700 rounded px-2 py-1.5 focus:border-ianuarius outline-none"
								>
									<option value="">Todos los meses</option>
									{MESES.map((m, i) => (
										<option key={i + 1} value={String(i + 1).padStart(2, '0')}>{m}</option>
									))}
								</select>
							</div>

							<div className="flex gap-1.5" role="group" aria-label="Filtrar por modalidad">
								{[['', 'Todas'], ['outdoor', 'Outdoor'], ['short_track', 'Indoor']].map(([val, label]) => (
									<button
										key={val}
										onClick={() => setFilterTemporada(val)}
										aria-pressed={filterTemporada === val}
										className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded transition ${
											filterTemporada === val
												? 'bg-ianuarius text-white'
												: 'border border-white/20 text-gray-400 hover:text-white hover:border-white/30'
										}`}
									>
										{label}
									</button>
								))}
							</div>
						</div>

						{/* lista */}
						<div
							className="flex-1 overflow-y-auto px-4 py-2 min-h-[200px]"
							role="list"
							aria-label="Lista de marcas personales"
							aria-live="polite"
						>
							{cargandoMarcas ? (
								<p className="label-muted text-center py-8">Cargando...</p>
							) : marcasVisible.length === 0 ? (
								<p className="label-muted text-center py-8 border border-dashed border-gray-700 rounded-lg mt-2">
									{marcasPerfil.length === 0 ? 'Sin marcas registradas' : 'Sin marcas para los filtros seleccionados'}
								</p>
							) : (
								marcasVisible.map(m => (
									<div
										key={m.id_marca}
										role="listitem"
										className="flex items-center justify-between py-2.5 border-b border-white/15 last:border-0 gap-3"
									>
										<div className="min-w-0 flex-1">
											<p className="text-white text-xs font-bold truncate">{m.prueba}</p>
											<p className="text-gray-400 text-[10px] truncate">{m.titulo_evento ?? m.tipo_competicion}</p>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
												m.temporada === 'short_track'
													? 'bg-blue-900/40 text-blue-400'
													: 'bg-green-900/40 text-green-400'
											}`}>
												{m.temporada === 'short_track' ? 'Indoor' : 'Out'}
											</span>
											<div className="text-right">
												<p className="text-ianuarius font-mono text-sm font-bold">{m.marca}</p>
												<p className="text-gray-400 text-[10px]">{formatFechaPerfil(m.fecha)}</p>
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{/* paginación */}
						{!cargandoMarcas && totalPaginas > 1 && (
							<div className="px-4 py-3 border-t border-white/20 flex items-center justify-between shrink-0">
								<button
									onClick={() => setMarcaPage(p => Math.max(0, p - 1))}
									disabled={marcaPage === 0}
									aria-label="Página anterior de marcas"
									className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
									</svg>
									Ant.
								</button>
								<span className="text-[10px] text-gray-500 uppercase tracking-widest" aria-live="polite" aria-atomic="true">
									{marcaPage + 1} / {totalPaginas}
								</span>
								<button
									onClick={() => setMarcaPage(p => Math.min(totalPaginas - 1, p + 1))}
									disabled={marcaPage >= totalPaginas - 1}
									aria-label="Página siguiente de marcas"
									className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
								>
									Sig.
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4" aria-hidden="true">
										<path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
									</svg>
								</button>
							</div>
						)}
					</div>

				</div>

				{/* COLUMNA CENTRAL — notificaciones + archivos */}
				<div className="lg:col-span-4 space-y-6">
					<Notificaciones user={user} onUserUpdate={onUserUpdate} />
					<MisArchivos user={user} onUserUpdate={onUserUpdate} onGoToInscripcion={() => onNavigate?.('inscripcion')} />
				</div>

				{/* COLUMNA DERECHA — avatar + info personal + email + contraseña + zona peligro */}
				<div className="lg:col-span-3 space-y-6">

					<div className="flex items-center gap-6 p-6 bg-gris rounded-lg border border-white/20">
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

					<div className="bg-gris rounded-lg border border-white/20 overflow-hidden">
						<SectionHeader
							title="Información personal"
							action={
								!editando && (
									<button
										onClick={() => { setEditando(true); setInfoMsg(''); }}
										className="text-gray-400 hover:text-white transition"
										title="Editar información"
										aria-label="Editar información personal"
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
										<label htmlFor="perfil-nombre" className={labelClasses}>Nombre</label>
										<input id="perfil-nombre" type="text" name="nombre" className={inputClasses} value={form.nombre} onChange={handleInfoChange} required />
									</div>
									<div>
										<label htmlFor="perfil-apellidos" className={labelClasses}>Apellidos</label>
										<input id="perfil-apellidos" type="text" name="apellidos" className={inputClasses} value={form.apellidos} onChange={handleInfoChange} required />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label htmlFor="perfil-fecha" className={labelClasses}>Fecha de nacimiento</label>
										<input id="perfil-fecha" type="date" name="fecha_nacimiento" className={inputClasses + " [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"} value={form.fecha_nacimiento} onChange={handleInfoChange} required />
									</div>
									<div>
										<label htmlFor="perfil-genero" className={labelClasses}>Género</label>
										<select id="perfil-genero" name="genero" className={inputClasses} value={form.genero} onChange={handleInfoChange} required>
											<option value="M">Masculino</option>
											<option value="F">Femenino</option>
										</select>
									</div>
								</div>
								{infoMsg && (
									<p className={`text-xs text-center ${infoMsg === 'Datos actualizados' ? 'text-green-400' : 'text-red-400'}`}>{infoMsg}</p>
								)}
								<div className="flex gap-3">
									<button type="submit" disabled={infoLoading} className="flex-1 bg-ianuarius text-white label-caps py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
										{infoLoading ? 'Guardando...' : 'Guardar cambios'}
									</button>
									<button type="button" onClick={cancelarEdicion} className="flex-1 border border-white/20 text-gray-400 label-caps py-2 rounded hover:text-white hover:border-white/30 transition">
										Cancelar
									</button>
								</div>
							</form>
						)}
					</div>

					<div className="bg-gris rounded-lg border border-white/20 overflow-hidden">
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
										<label htmlFor="perfil-email" className={labelClasses}>Nuevo email</label>
										<input id="perfil-email" type="email" className={inputClasses} value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)} placeholder="nuevo@email.com" required />
									</div>
									{emailMsg && (
										<p className={`text-xs text-center ${emailMsg === 'Email actualizado' ? 'text-green-400' : 'text-red-400'}`}>{emailMsg}</p>
									)}
									<button type="submit" disabled={emailLoading} className="w-full bg-ianuarius text-white label-caps py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
										{emailLoading ? 'Guardando...' : 'Confirmar cambio'}
									</button>
								</form>
							)}
						</div>
					</div>

					<div className="bg-gris rounded-lg border border-white/20 overflow-hidden">
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
							<p className="text-gray-400 text-sm tracking-[0.3em]">••••••••••••</p>
							{showPass && (
								<form onSubmit={handlePassChange} className="mt-4 space-y-3">
									<div>
										<label htmlFor="perfil-pwd-actual" className={labelClasses}>Contraseña actual</label>
										<input id="perfil-pwd-actual" type="password" className={inputClasses} value={passForm.actual} onChange={e => setPassForm({ ...passForm, actual: e.target.value })} placeholder="••••••••" required />
									</div>
									<div>
										<label htmlFor="perfil-pwd-nueva" className={labelClasses}>Nueva contraseña</label>
										<input id="perfil-pwd-nueva" type="password" className={inputClasses} value={passForm.nueva} onChange={e => setPassForm({ ...passForm, nueva: e.target.value })} placeholder="••••••••" required />
									</div>
									<div>
										<label htmlFor="perfil-pwd-confirm" className={labelClasses}>Confirmar nueva contraseña</label>
										<input id="perfil-pwd-confirm" type="password" className={inputClasses} value={passForm.confirmar} onChange={e => setPassForm({ ...passForm, confirmar: e.target.value })} placeholder="••••••••" required />
									</div>
									{passMsg && (
										<p className={`text-xs text-center ${passMsg === 'Contraseña actualizada' ? 'text-green-400' : 'text-red-400'}`}>{passMsg}</p>
									)}
									<button type="submit" disabled={passLoading} className="w-full bg-ianuarius text-white label-caps py-2 rounded hover:bg-red-700 transition disabled:opacity-50">
										{passLoading ? 'Guardando...' : 'Confirmar cambio'}
									</button>
								</form>
							)}
						</div>
					</div>

					<div className="bg-gris rounded-lg border border-red-900/40 overflow-hidden">
						<SectionHeader
							title="Zona de peligro"
							action={
								<button
									onClick={() => { setShowDelete(v => !v); setDeleteMsg(''); }}
									className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition"
								>
									{showDelete ? 'Cancelar' : 'Eliminar cuenta'}
								</button>
							}
						/>
						{showDelete && (
							<div className="p-6 space-y-4">
								<p className="text-gray-400 text-xs leading-relaxed">
									Esta acción eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
								</p>
								{deleteMsg && (
									<p className="text-xs text-center text-red-400">{deleteMsg}</p>
								)}
								<button
									onClick={handleEliminarCuenta}
									disabled={deleteLoading}
									className="w-full bg-red-700 text-white label-caps py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
								>
									{deleteLoading ? 'Eliminando...' : 'Confirmar — eliminar mi cuenta'}
								</button>
							</div>
						)}
					</div>

				</div>

			</div>

		</div>
	);
}
