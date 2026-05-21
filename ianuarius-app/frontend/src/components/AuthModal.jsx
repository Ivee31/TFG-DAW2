import { useState, useLayoutEffect, useRef } from 'react';
import Login from './Login';
import Register from './Register';

export default function AuthModal({ onClose, onLoginSuccess, onGoogleNeedsCompletion, initialMode = 'login' }) {
	const [isRegister, setIsRegister] = useState(initialMode === 'register');
	const frontRef = useRef(null);
	const backRef = useRef(null);
	const [containerHeight, setContainerHeight] = useState(0);

	useLayoutEffect(() => {
		const ref = isRegister ? backRef : frontRef;
		if (ref.current) setContainerHeight(ref.current.scrollHeight);
	}, [isRegister]);

	const toggle = () => setIsRegister(v => !v);

	return (
		<div className="w-full">
			{/* Toggle switch */}
			<div className="flex items-center justify-center gap-5 mb-4">
				<span
					className="text-xs font-black tracking-widest uppercase cursor-pointer select-none"
					style={{
						color: isRegister ? '#fff' : '#6B7280',
						textDecoration: isRegister ? 'underline' : 'none',
						textUnderlineOffset: '3px',
						transition: 'color 0.3s ease',
					}}
					onClick={() => !isRegister && toggle()}
				>
					Registro
				</span>

				<button
					onClick={toggle}
					aria-label="Cambiar modo"
					style={{
						position: 'relative',
						width: '52px',
						height: '26px',
						flexShrink: 0,
						cursor: 'pointer',
						background: 'none',
						border: 'none',
						padding: 0,
					}}
				>
					{/* Track */}
					<span style={{
						position: 'absolute',
						inset: 0,
						borderRadius: '5px',
						border: '2px solid',
						borderColor: isRegister ? '#FE0000' : '#4B5563',
						backgroundColor: isRegister ? 'rgba(254,0,0,0.15)' : 'transparent',
						boxShadow: `3px 3px 0 ${isRegister ? '#7f1212' : '#374151'}`,
						transition: 'border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
					}} />
					{/* Knob */}
					<span style={{
						position: 'absolute',
						top: '3px',
						left: isRegister ? '3px' : '29px',
						width: '16px',
						height: '16px',
						borderRadius: '3px',
						backgroundColor: '#fff',
						border: '1.5px solid #9CA3AF',
						boxShadow: `0 2px 0 ${isRegister ? '#7f1212' : '#374151'}`,
						transition: 'left 0.3s ease, box-shadow 0.3s ease',
					}} />
				</button>

				<span
					className="text-xs font-black tracking-widest uppercase cursor-pointer select-none"
					style={{
						color: !isRegister ? '#fff' : '#6B7280',
						textDecoration: !isRegister ? 'underline' : 'none',
						textUnderlineOffset: '3px',
						transition: 'color 0.3s ease',
					}}
					onClick={() => isRegister && toggle()}
				>
					Acceso
				</span>
			</div>

			{/* 3D flip card */}
			<div style={{
				perspective: '1200px',
				height: `${containerHeight}px`,
				transition: 'height 0.7s ease',
				position: 'relative',
			}}>
				<div style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					transformStyle: 'preserve-3d',
					transition: 'transform 0.7s ease',
					transform: isRegister ? 'rotateY(180deg)' : 'rotateY(0deg)',
				}}>
					{/* Front — Login */}
					<div
						ref={frontRef}
						style={{
							position: 'absolute',
							width: '100%',
							backfaceVisibility: 'hidden',
							WebkitBackfaceVisibility: 'hidden',
						}}
					>
						<Login
							onClose={onClose}
							onLoginSuccess={onLoginSuccess}
							onGoogleNeedsCompletion={onGoogleNeedsCompletion}
						/>
					</div>

					{/* Back — Register */}
					<div
						ref={backRef}
						style={{
							position: 'absolute',
							width: '100%',
							backfaceVisibility: 'hidden',
							WebkitBackfaceVisibility: 'hidden',
							transform: 'rotateY(180deg)',
						}}
					>
						<Register
							onClose={onClose}
							onRegisterSuccess={onLoginSuccess}
							onGoogleNeedsCompletion={onGoogleNeedsCompletion}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
