import { useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';

function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 300);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return createPortal(
		<button
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
			aria-label="Volver arriba"
			className="btn-back-top"
			style={{
				position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
				opacity: visible ? 1 : 0,
				pointerEvents: visible ? 'auto' : 'none',
				transition: 'opacity 0.3s ease, width 0.3s ease, border-radius 0.3s ease, background-color 0.3s ease',
			}}
		>
			<svg className="btt-icon" viewBox="0 0 384 512" aria-hidden="true">
				<path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
			</svg>
		</button>,
		document.body
	);
}

export default memo(BackToTop);
