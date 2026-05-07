// frontend/src/App.jsx
import { useState, useEffect } from "react";
import { API } from "./api";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import DashboardEntrenador from "./components/DashboardEntrenador";
import AdminPanel from "./components/AdminPanel";
import Home from './components/Home';
import ResetPassword from './components/ResetPassword';
import CompleteGoogleProfile from './components/CompleteGoogleProfile';
import AvisoLegal from './components/AvisoLegal';

export default function App() {
	const [user, setUser] = useState(null);
	const [cargandoSesion, setCargandoSesion] = useState(true);
	const [googleCompleteData, setGoogleCompleteData] = useState(null);

	useEffect(() => {
		fetch(`${API}/session`, { credentials: 'include' })
			.then(res => res.json())
			.then(data => {
				if (data.status === 'success') setUser(data.user);
			})
			.catch(() => {})
			.finally(() => setCargandoSesion(false));
	}, []);

	if (cargandoSesion) {
		return (
			<div className="bg-oscuro min-h-screen flex items-center justify-center">
				<span className="text-gray-600 text-xs uppercase tracking-[0.4em] animate-pulse">
					Cargando...
				</span>
			</div>
		);
	}

	// aviso legal
	const page = new URLSearchParams(window.location.search).get('page');
	if (page === 'aviso-legal') {
		return <AvisoLegal onBack={() => window.history.replaceState({}, '', '/')} />;
	}

	// enlace de recuperacion de contraseña en la URL
	const resetToken = new URLSearchParams(window.location.search).get('reset_token');
	if (resetToken) {
		return (
			<ResetPassword
				token={resetToken}
				onDone={() => window.history.replaceState({}, '', '/')}
			/>
		);
	}

	// completar perfil tras Google login (usuario nuevo)
	if (googleCompleteData) {
		return (
			<CompleteGoogleProfile
				data={googleCompleteData}
				onSuccess={(u) => { setGoogleCompleteData(null); setUser(u); }}
				onCancel={() => setGoogleCompleteData(null)}
			/>
		);
	}

	return (
		<>
			{user ? (
				<Layout user={user} onLogout={() => setUser(null)} onUserUpdate={setUser}>
					{user.rol === 'Admin'      && <AdminPanel />}
					{user.rol === 'Entrenador' && <DashboardEntrenador />}
					{user.rol === 'Atleta'     && <Dashboard />}
				</Layout>
			) : (
				<Home onLoginSuccess={setUser} onGoogleNeedsCompletion={setGoogleCompleteData} />
			)}
		</>
	);
}
