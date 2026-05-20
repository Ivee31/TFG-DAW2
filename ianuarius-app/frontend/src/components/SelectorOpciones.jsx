import { useRef, useLayoutEffect, useState } from 'react';

export default function SelectorOpciones({ opciones, valor, onChange, nombre }) {
	const containerRef = useRef(null);
	const [indStyle, setIndStyle] = useState({});
	const idxActivo = opciones.findIndex(o => o.valor === valor);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const labels = container.querySelectorAll('label');
		const active = labels[idxActivo];
		if (!active) return;
		const cRect = container.getBoundingClientRect();
		const aRect = active.getBoundingClientRect();
		setIndStyle({
			left: aRect.left - cRect.left + 2,
			width: aRect.width - 4,
		});
	}, [idxActivo, opciones]);

	return (
		<div ref={containerRef} className="selector-opciones" role="radiogroup">
			<span className="selector-opciones__indicador" style={indStyle} aria-hidden="true" />
			{opciones.map(op => (
				<label
					key={op.valor}
					className={`selector-opciones__item${valor === op.valor ? ' selector-opciones__item--activo' : ''}`}
				>
					<input
						type="radio"
						name={nombre}
						value={op.valor}
						checked={valor === op.valor}
						onChange={() => onChange(op.valor)}
					/>
					{op.etiqueta}
				</label>
			))}
		</div>
	);
}
