import { useState } from 'react';

/**
 * componente para el formulario de acceso
 */
export default function Login() {
    // memoria campos
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    /**
     * enviar datos al backend
     */
    const handleLogin = (e) => {
        e.preventDefault();
        setErrorMsg('');

        fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(`Bienvenido, ${data.user.nombre}`);
            } else {
                setErrorMsg(data.error);
            }
        })
        .catch(err => {
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
                    className="w-full bg-ianuarius text-white font-bold py-2 rounded hover:bg-red-700 transition duration-300 text-sm">
                    ENTRAR
                </button>
            </form>
        </div>
    );
}