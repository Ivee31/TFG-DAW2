import { useState, useRef, useEffect } from 'react';

const ChevronIcon = ({ open }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 20 20"
		fill="currentColor"
		width="12"
		height="12"
		style={{
			flexShrink: 0,
			transition: 'transform 0.2s ease',
			transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
		}}
	>
		<path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z" clipRule="evenodd" />
	</svg>
);

export default function CustomSelect({
	value,
	onChange,
	options = [],
	placeholder,
	name,
	className = '',
	style = {},
	containerClassName = '',
	id,
	'aria-label': ariaLabel,
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		if (!open) return;
		const handler = (e) => {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	const selected = options.find(o => String(o.value) === String(value));
	const displayLabel = selected ? selected.label : (placeholder ?? '');

	const handleSelect = (optValue) => {
		onChange({ target: { name: name ?? '', value: optValue } });
		setOpen(false);
	};

	return (
		<div ref={ref} className={containerClassName} style={{ position: 'relative' }}>
			<button
				type="button"
				id={id}
				aria-label={ariaLabel}
				aria-expanded={open}
				aria-haspopup="listbox"
				onClick={() => setOpen(v => !v)}
				className={className}
				style={{
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					gap: '8px',
					textAlign: 'left',
					cursor: 'pointer',
					...style,
				}}
			>
				<span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
					{displayLabel}
				</span>
				<ChevronIcon open={open} />
			</button>

			{open && (
				<div
					role="listbox"
					style={{
						position: 'absolute',
						top: 'calc(100% + 4px)',
						left: 0,
						right: 0,
						zIndex: 50,
						background: '#171717',
						border: '2px solid #4B5563',
						borderRadius: '5px',
						boxShadow: '3px 3px 0 #374151',
						overflow: 'hidden',
						maxHeight: '220px',
						overflowY: 'auto',
					}}
				>
					{options.map((opt, i) => {
						const isSelected = String(opt.value) === String(value);
						return (
							<button
								key={i}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => handleSelect(opt.value)}
								style={{
									width: '100%',
									padding: '9px 12px',
									textAlign: 'left',
									background: isSelected ? 'rgba(254,0,0,0.15)' : 'transparent',
									color: isSelected ? '#FE0000' : '#fff',
									fontSize: '13px',
									fontWeight: 600,
									cursor: 'pointer',
									border: 'none',
									borderBottom: i < options.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
									display: 'block',
									transition: 'background 0.1s ease, color 0.1s ease',
								}}
								onMouseEnter={e => {
									if (!isSelected) {
										e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
									}
								}}
								onMouseLeave={e => {
									if (!isSelected) {
										e.currentTarget.style.background = 'transparent';
									}
								}}
							>
								{opt.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
