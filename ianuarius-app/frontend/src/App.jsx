// frontend/src/App.jsx
import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Home from './components/Home';

export default function App() {
	
	// estado de usuario logged
	const [user, setUser] = useState(null);

	return (
		<>
			{user ? (
				<Layout user={user} onLogout={() => setUser(null)}>
					<Dashboard />
				</Layout>
			) : (
				<Home onLoginSuccess={setUser} />
			)}

		</>
	);
}