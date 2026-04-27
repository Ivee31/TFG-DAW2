import { useState } from 'react';

// componente para form de acceso
export default function Login({onLoginSuccess}) {
    // memoria campos
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // enviar datos al backend
    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        fetch('https://ianuarius-back.infinityfreeapp.com/api/login', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            setLoading(false);
            
            if (data.status === 'success') {
                // envio datos a App.jsx
                onLoginSuccess(data.user);

            } else {
                setErrorMsg(data.error);
            }
        })
        .catch(err => {
            setLoading(false);
            setErrorMsg("Error de conexion");
        });
    };

    return (
        <div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
            <h2 className="text-2xl font-black text-white mb-4 text-center tracking-widest">
                ACCESO
            </h2>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-xs">Email</label>
                    <input type="email"
                           className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                           placeholder="atleta@ianuarius.com"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1 text-xs">Password</label>
                    <input type="password"
                           className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {loading ? 'CARGANDO...' : 'ENTRAR'}

                </button>
            </form>
        </div>
    );
}