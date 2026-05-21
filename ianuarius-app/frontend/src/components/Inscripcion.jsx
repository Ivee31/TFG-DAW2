import { useState, useRef, useEffect } from 'react';
import { API } from '../api';
import BtnDescarga from './BtnDescarga';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = reject;
	reader.readAsDataURL(file);
});

export default function Inscripcion({ user, onUserUpdate }) {
	const fileRef = useRef(null);
	const [loading, setLoading]         = useState(false);
	const [error, setError]             = useState('');
	const [ok, setOk]                   = useState(false);
	const [plantilla, setPlantilla]     = useState(null);
	const [cargandoP, setCargandoP]     = useState(false);
	const [visorAbierto, setVisorAbierto] = useState(false);
	const [plantillaError, setPlantillaError] = useState(false);

	const inscripcionCompleta = !!(user?.inscripcion_pdf || user?.inscripcion_formulario);
	const isPdf = user?.inscripcion_pdf?.startsWith('data:application/pdf');

	const handleDescarga = async () => {
		const p = await cargarPlantilla();
		if (!p) throw new Error('plantilla no disponible');
		const a = document.createElement('a');
		a.href = p;
		a.download = 'plantilla_inscripcion.pdf';
		a.click();
	};

	const cargarPlantilla = async () => {
		if (plantilla) return plantilla;
		setCargandoP(true);
		setPlantillaError(false);
		try {
			const r = await fetch(`${API}/admin/plantilla-inscripcion`, { credentials: 'include' });
			const d = await r.json();
			if (d.status === 'success') { setPlantilla(d.pdf); return d.pdf; }
			setPlantillaError(true);
		} catch {
			setPlantillaError(true);
		} finally {
			setCargandoP(false);
		}
		return null;
	};

	useEffect(() => {
		if (!visorAbierto) return;
		const onKey = (e) => { if (e.key === 'Escape') setVisorAbierto(false); };
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [visorAbierto]);

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

			{visorAbierto && (
				<div
					className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
					onClick={() => setVisorAbierto(false)}
				>
					<div className="flex items-center justify-between px-6 py-3 bg-gris border-b border-white/20 shrink-0" onClick={e => e.stopPropagation()}>
						<div>
							<p className="text-white text-sm font-black uppercase tracking-widest">Formulario de inscripción</p>
							<p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">Rellena los campos y descarga el PDF completado desde el visor</p>
						</div>

						<button
							onClick={() => setVisorAbierto(false)}
							className="w-8 h-8 flex items-center justify-center rounded border-2 border-[#4B5563] bg-oscuro text-gray-400 shadow-[2px_2px_0_#374151] neo-press hover:text-white transition"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
						<iframe
							src={plantilla}
							className="w-full h-full border-0"
							title="Formulario de inscripción"
						/>
					</div>
				</div>
			)}

			{inscripcionCompleta ? (
				<div className="flex items-center gap-3 px-5 py-3 bg-green-500/10 border-2 border-green-500/30 shadow-[3px_3px_0_#14532d] rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-green-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
					</svg>
					<p className="text-green-500 text-xs font-bold uppercase tracking-widest">Inscripción presentada para la temporada actual</p>
				</div>
			) : (
				<div className="flex items-center gap-3 px-5 py-3 bg-yellow-400/10 border-2 border-yellow-400/30 shadow-[3px_3px_0_#78650a] rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-yellow-400 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
					</svg>
					<p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Inscripción pendiente para la temporada actual</p>
				</div>
			)}

			<div className="bg-gris rounded-lg border-2 border-white/15 shadow-[4px_4px_0_#374151] p-6">
				<p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Inscripción de Temporada</p>
				<h2 className="text-2xl font-black tracking-tight text-white mb-3">Formaliza tu inscripción</h2>
				<p className="text-gray-400 text-sm leading-relaxed">
					Para participar en los entrenamientos y competiciones de la temporada debes completar tu inscripción.
					Puedes rellenar el formulario directamente en el navegador o descargarlo para completarlo localmente.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

				{/* Formulario oficial */}
				<div className="bg-gris rounded-lg border-2 border-ianuarius/30 shadow-[4px_4px_0_#7f1212] p-6 space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-ianuarius/10 border-2 border-ianuarius/30 shadow-[2px_2px_0_#7f1212] rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-ianuarius">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
							</svg>
						</div>

						<div>
							<h3 className="text-sm font-black uppercase tracking-wide text-white">Formulario oficial</h3>
							<p className="text-gray-400 text-[10px] uppercase tracking-wider">Rellenar o descargar</p>
						</div>
					</div>

					<p className="text-gray-400 text-xs leading-relaxed">
						Rellena el formulario directamente en el navegador o descárgalo para completarlo en local.
					</p>

					<div className="space-y-2">
						<button
							disabled={cargandoP}
							onClick={async () => { const p = await cargarPlantilla(); if (p) setVisorAbierto(true); }}
							className="w-full flex items-center justify-center gap-2 bg-ianuarius text-white label-caps py-3 rounded border-2 border-[#FE0000] shadow-[4px_4px_0_#7f1212] neo-press hover:bg-red-700 transition disabled:opacity-50"
						>
							{cargandoP ? (
								<svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
								</svg>
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
								</svg>
							)}
							Rellenar en el navegador
						</button>

						<div className="flex justify-center pt-1">
							<BtnDescarga onDescargar={handleDescarga} />
						</div>

						{plantillaError && (
							<p className="text-red-400 text-[10px] uppercase tracking-widest text-center">Error al cargar la plantilla</p>
						)}
					</div>
				</div>

				{/* Subir PDF firmado */}
				<div className="bg-gris rounded-lg border-2 border-white/15 shadow-[4px_4px_0_#374151] p-6 space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/5 border-2 border-[#4B5563] shadow-[2px_2px_0_#374151] rounded-lg flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
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
						<div className="rounded border-2 border-white/15 shadow-[2px_2px_0_#374151] p-3 flex items-center gap-3">
							{isPdf ? (
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-gray-400 shrink-0">
									<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
								</svg>
							) : (
								<img src={user.inscripcion_pdf} alt="Inscripción subida" className="w-16 h-12 object-cover rounded" />
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
						className="w-full flex items-center justify-center gap-2 border-2 border-[#4B5563] shadow-[3px_3px_0_#374151] text-white label-caps py-3 rounded neo-press hover:border-white/40 hover:bg-white/5 transition disabled:opacity-40"
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
