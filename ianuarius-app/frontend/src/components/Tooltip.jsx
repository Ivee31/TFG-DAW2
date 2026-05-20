export default function Tooltip({ text, children }) {
	return (
		<span className="tooltip-wrap">
			{children ?? (
				<button
					type="button"
					tabIndex={0}
					aria-label="Más información"
					className="shrink-0 w-4 h-4 rounded-full border border-white/20 text-gray-400 hover:border-white/40 hover:text-gray-300 flex items-center justify-center transition"
				>
					<span className="text-[9px] font-black leading-none select-none">i</span>
				</button>
			)}
			<span className="tooltip-box" role="tooltip">{text}</span>
		</span>
	);
}
