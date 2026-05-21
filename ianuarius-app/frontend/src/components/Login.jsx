import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API } from '../api';
import ForgotPassword from './ForgotPassword';

const GoogleIcon = () => (
	<svg viewBox="0 0 24 24" width="20" height="20">
		<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
		<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
		<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
		<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
	</svg>
);

const card = {
	padding: '24px',
	background: '#262626',
	display: 'flex',
	flexDirection: 'column',
	gap: '16px',
	borderRadius: '8px',
	border: '2px solid rgba(255,255,255,0.15)',
	boxShadow: '4px 4px 0 #FE0000',
};

const inputStyle = {
	width: '100%',
	height: '40px',
	borderRadius: '5px',
	border: '2px solid #4B5563',
	backgroundColor: '#171717',
	boxShadow: '3px 3px 0 #374151',
	fontSize: '14px',
	fontWeight: 600,
	color: '#fff',
	padding: '5px 10px',
	outline: 'none',
};

export default function Login({ onLoginSuccess, onGoogleNeedsCompletion }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [loading, setLoading] = useState(false);
	const [showForgot, setShowForgot] = useState(false);

	const handleLogin = (e) => {
		e.preventDefault();
		setErrorMsg('');
		setLoading(true);
		fetch(`${API}/login`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ email, password })
		})
		.then(res => res.json())
		.then(data => {
			setLoading(false);
			if (data.status === 'success') onLoginSuccess(data.user);
			else setErrorMsg(data.error);
		})
		.catch(() => { setLoading(false); setErrorMsg('Error de conexion'); });
	};

	const googleLogin = useGoogleLogin({
		onSuccess: (tokenResponse) => {
			fetch(`${API}/google-login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ access_token: tokenResponse.access_token })
			})
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') onLoginSuccess(data.user);
				else if (data.status === 'needs_completion') onGoogleNeedsCompletion(data.google_data);
				else setErrorMsg(data.error || 'Error con Google');
			})
			.catch(() => setErrorMsg('Error de conexion'));
		},
		onError: () => setErrorMsg('Error al iniciar sesión con Google'),
	});

	if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;

	return (
		<div style={card}>
			<div>
				<div style={{ color: '#fff', fontWeight: 900, fontSize: '20px', letterSpacing: '0.05em' }}>
					Bienvenido,
				</div>
				<div style={{ color: '#9CA3AF', fontWeight: 600, fontSize: '14px' }}>
					accede para continuar
				</div>
			</div>

			{errorMsg && (
				<div style={{ background: 'rgba(254,0,0,0.1)', border: '1px solid #FE0000', color: '#FE0000', padding: '8px', borderRadius: '5px', fontSize: '12px', textAlign: 'center' }}>
					{errorMsg}
				</div>
			)}

			<form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
					style={inputStyle}
					className="neo-input"
				/>
				<input
					type="password"
					placeholder="Contraseña"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
					style={inputStyle}
					className="neo-input"
				/>
				<button
					type="submit"
					disabled={loading}
					style={{
						marginTop: '8px',
						width: '100%',
						height: '40px',
						borderRadius: '5px',
						border: '2px solid #FE0000',
						backgroundColor: '#FE0000',
						boxShadow: loading ? 'none' : '4px 4px 0 #7f1212',
						fontSize: '14px',
						fontWeight: 700,
						color: '#fff',
						cursor: loading ? 'not-allowed' : 'pointer',
						opacity: loading ? 0.6 : 1,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
					}}
					className="neo-press"
				>
					{loading && (
						<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
					)}
					{loading ? 'CARGANDO...' : 'ENTRAR →'}
				</button>
			</form>

			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<button
					onClick={() => googleLogin()}
					style={{
						width: '40px',
						height: '40px',
						borderRadius: '100%',
						border: '2px solid #4B5563',
						backgroundColor: '#171717',
						boxShadow: '3px 3px 0 #374151',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						cursor: 'pointer',
						flexShrink: 0,
					}}
					className="neo-press"
				>
					<GoogleIcon />
				</button>
				<span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>
					Continuar con Google
				</span>
			</div>

			<button
				onClick={() => setShowForgot(true)}
				style={{
					background: 'none',
					border: 'none',
					color: '#6B7280',
					fontSize: '10px',
					textTransform: 'uppercase',
					letterSpacing: '0.1em',
					cursor: 'pointer',
					padding: 0,
				}}
			>
				¿Olvidaste tu contraseña?
			</button>
		</div>
	);
}
