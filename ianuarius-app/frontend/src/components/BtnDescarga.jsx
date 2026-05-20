import { useState, useRef } from 'react';

export default function BtnDescarga({ onDescargar, label = 'Descargar PDF', labelListo = 'Descargado' }) {
	const [estado, setEstado] = useState('idle');
	const timerRef = useRef(null);

	const handleClick = async () => {
		if (estado !== 'idle') return;
		setEstado('descargando');
		clearTimeout(timerRef.current);

		let ok = true;
		const descarga = onDescargar().catch(() => { ok = false; });
		await Promise.all([descarga, new Promise(r => setTimeout(r, 3200))]);

		setEstado(ok ? 'listo' : 'idle');
		if (ok) timerRef.current = setTimeout(() => setEstado('idle'), 2500);
	};

	const cls = `btn-descarga${estado === 'descargando' ? ' btn-descarga--descargando' : ''}${estado === 'listo' ? ' btn-descarga--listo' : ''}`;

	return (
		<button type="button" onClick={handleClick} disabled={estado !== 'idle'} className={cls}>
			<span className="btn-descarga__circulo">
				<svg className="btn-descarga__icono" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 19V5m0 14-4-4m4 4 4-4" />
				</svg>
				<svg className="btn-descarga__icono-ok" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
				</svg>
				<span className="btn-descarga__cuadrado" />
			</span>
			<span className="btn-descarga__texto">{label}</span>
			<span className="btn-descarga__texto btn-descarga__texto--ok">{labelListo}</span>
		</button>
	);
}
