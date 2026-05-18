import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { API } from '../api';
import ForgotPassword from './ForgotPassword';

const GoogleIcon = () => (
	<svg viewBox="0 0 24 24" className="w-4 h-4">
		<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
		<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
		<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
		<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
	</svg>
);

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
		<div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
			<h2 className="text-2xl font-black text-white mb-4 text-center tracking-widest">ACCESO</h2>
			{errorMsg && (
				<div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
					{errorMsg}
				</div>
			)}
			<form onSubmit={handleLogin} className="space-y-4">
				<div>
					<label htmlFor="login-email" className="block text-gray-400 mb-1 text-xs">Email</label>
					<input id="login-email" type="email" className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:ring-2 focus:ring-ianuarius/40 text-sm" placeholder="atleta@ianuarius.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
				</div>
				<div>
					<label htmlFor="login-password" className="block text-gray-400 mb-1 text-xs">Password</label>
					<input id="login-password" type="password" className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:ring-2 focus:ring-ianuarius/40 text-sm" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				<button type="submit" disabled={loading} className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
					{loading && (
						<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					)}
					{loading ? 'CARGANDO...' : 'ENTRAR'}
				</button>
			</form>
			<div className="mt-3 space-y-2">
				<button onClick={() => googleLogin()} className="w-full border border-white/20 bg-white/5 text-white font-bold py-2 rounded hover:bg-white/10 transition duration-300 text-sm flex items-center justify-center gap-2">
					<GoogleIcon />
					Continuar con Google
				</button>
				<p className="flex items-center justify-center gap-1 text-[9px] text-green-500/60 -mt-1">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
						<path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
					</svg>
					Opción más segura
				</p>
				<button onClick={() => setShowForgot(true)} className="w-full text-gray-400 hover:text-white text-[10px] uppercase tracking-widest transition">
					¿Olvidaste tu contraseña?
				</button>
			</div>
		</div>
	);
}
