// frontend/src/App.jsx
import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Home from './components/Home';

export default function App() {

    // estado de usuario logged
    const [user, setUser] = useState(null);
    // mientras se comprueba la sesion existente, no mostrar nada
    const [cargandoSesion, setCargandoSesion] = useState(true);

    // al arrancar, consulta si hay sesion activa (persiste tras refresco)
    useEffect(() => {
        fetch('/api/session', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') setUser(data.user);
            })
            .catch(() => {}) // si falla la red, mostramos Home
            .finally(() => setCargandoSesion(false));
    }, []);

    // pantalla de carga minima mientras se verifica la sesion
    if (cargandoSesion) {
        return (
            <div className="bg-oscuro min-h-screen flex items-center justify-center">
                <span className="text-gray-600 text-xs uppercase tracking-[0.4em] animate-pulse">
                    Cargando...
                </span>
            </div>
        );
    }

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