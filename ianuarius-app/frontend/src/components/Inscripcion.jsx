import { useState, useRef, useEffect } from 'react';
import { API } from '../api';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = reject;
	reader.readAsDataURL(file);
});

export default function Inscripcion({ user, onUserUpdate }) {
	const fileRef = useRef(null);
	const [loading, setLoading]     = useState(false);
	const [error, setError]         = useState('');
	const [ok, setOk]               = useState(false);
	const [plantilla, setPlantilla] = useState(null);
	const [cargandoP, setCargandoP] = useState(true);

	const inscripcionCompleta = !!(user?.inscripcion_pdf || user?.inscripcion_formulario);
	const isPdf = user?.inscripcion_pdf?.startsWith('data:application/pdf');

	useEffect(() => {
		fetch(`${API}/admin/plantilla-inscripcion`, { credentials: 'include' })
			.then(r => r.json())
			.then(d => { if (d.status === 'success') setPlantilla(d.pdf); })
			.catch(() => {})
			.finally(() => setCargandoP(false));
	}, []);

	const handleFile = async (file) => {
		setLoading(true);
		setError('');
		setOk(false);
		try {
			const base64 = await fileToBase64(file);
			if (base64.length > 5000000) throw new Error('Archivo demasiado grande (máx. ~3,7 MB)');
			const res = await fetch(`${API}/usuarios/inscripcion-pdf`, {
				method: 'PUT',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ foto: base64 })
			});
			const d = await res.json();
			if (d.status !== 'success') throw new Error(d.error || 'Error al guardar');
			onUserUpdate({ ...user, inscripcion_pdf: base64 });
			setOk(true);
		} catch (e) {
			setError(e.message || 'Error al subir el archivo');
		}
		setLoading(false);
	};

	return (
		<div className="space-y-6 max-w-2xl">

			{inscripcionCompleta ? (
				<div className="flex items-center gap-3 px-5 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
					<p className="text-green-500 text-xs font-bold uppercase tracking-widest">Inscripción presentada para la temporada actual</p>
				</div>
			) : (
				<div className="flex items-center gap-3 px-5 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-yellow-400 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
					</svg>
					<p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Inscripción pendiente para la temporada actual</p>
				</div>
			)}

			<div className="bg-gris rounded-lg border border-white/10 p-6">
				<p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Inscripción de Temporada</p>
				<h2 className="text-2xl font-black tracking-tight text-white mb-3">Formaliza tu inscripción</h2>
				<p className="text-gray-400 text-sm leading-relaxed">
					Para participar en los entrenamientos y competiciones de la temporada debes completar tu inscripción.
					Descarga el formulario oficial, complétalo, fírmalo y sube el PDF escaneado.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

				{/* Descargar plantilla */}
				<div className="bg-gris rounded-lg border border-white/10 p-6 space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-ianuarius/10 border border-ianuarius/30 rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-ianuarius">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-black uppercase tracking-wide text-white">Descargar plantilla</h3>
							<p className="text-gray-400 text-[10px] uppercase tracking-wider">Formulario oficial</p>
						</div>
					</div>

					<p className="text-gray-400 text-xs leading-relaxed">
						Descarga el formulario oficial de inscripción, complétalo a mano y fírmalo antes de subirlo.
					</p>

					{cargandoP ? (
						<div className="w-full py-3 flex items-center justify-center">
							<span className="text-gray-500 text-[10px] uppercase tracking-widest animate-pulse">Cargando...</span>
						</div>
					) : plantilla ? (
						<a
							href={plantilla}
							download="plantilla_inscripcion.pdf"
							className="w-full flex items-center justify-center gap-2 bg-ianuarius text-white text-[10px] font-black uppercase tracking-widest py-3 rounded hover:bg-red-700 transition"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
							</svg>
							Descargar PDF
						</a>
					) : (
						<div className="w-full py-3 text-center border border-dashed border-gray-700 rounded">
							<p className="text-gray-500 text-[10px] uppercase tracking-widest">Pendiente — el administrador aún no ha subido la plantilla</p>
						</div>
					)}
				</div>

				{/* Subir PDF firmado */}
				<div className="bg-gris rounded-lg border border-white/10 p-6 space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
							</svg>
						</div>
						<div>
							<h3 className="text-sm font-black uppercase tracking-wide text-white">Subir PDF firmado</h3>
							<p className="text-gray-400 text-[10px] uppercase tracking-wider">Completado y escaneado</p>
						</div>
					</div>

					<p className="text-gray-400 text-xs leading-relaxed">
						Una vez rellenado y firmado, sube el PDF escaneado para completar tu inscripción.
					</p>

					{user?.inscripcion_pdf && (
						<div className="rounded border border-white/10 p-3 flex items-center gap-3">
							{isPdf ? (
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 shrink-0">
									<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
								</svg>
							) : (
								<img src={user.inscripcion_pdf} alt="Inscripción" className="w-16 h-12 object-cover rounded" />
							)}
							<div>
								<p className="text-xs text-green-500 font-bold uppercase tracking-wider">Adjuntado</p>
								<p className="text-[10px] text-gray-400">{isPdf ? 'Documento PDF' : 'Imagen'}</p>
							</div>
						</div>
					)}

					{ok    && <p className="text-xs text-green-400 text-center">Archivo subido correctamente</p>}
					{error && <p className="text-xs text-red-400 text-center">{error}</p>}

					<input
						ref={fileRef}
						type="file"
						accept="application/pdf,image/jpeg,image/png,image/webp"
						className="hidden"
						onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); e.target.value = ''; }}
					/>

					<button
						disabled={loading}
						onClick={() => fileRef.current?.click()}
						className="w-full flex items-center justify-center gap-2 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded hover:border-white/40 hover:bg-white/5 transition disabled:opacity-40"
					>
						{loading ? (
							<>
								<svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
								Subiendo...
							</>
						) : (
							<>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
								</svg>
								{user?.inscripcion_pdf ? 'Reemplazar PDF' : 'Subir PDF firmado'}
							</>
						)}
					</button>
				</div>

			</div>
		</div>
	);
}
