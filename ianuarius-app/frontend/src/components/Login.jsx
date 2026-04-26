// frontend/src/components/Login.jsx

import { useState } from 'react';

export default function Login() {
  
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // memoria para guardar posibles errores
    const [errorMsg, setErrorMsg] = useState('');

    const handleLogin = (e) => {
    e.preventDefault(); 
    setErrorMsg(''); // limpiamos errores previos al reintentar

    // llamada POST a nuestra API
    fetch('/api/login', {
        method: 'POST',
        // Convertimos los datos de la memoria a una cadena JSON
        body: JSON.stringify({ 
            email: email, 
            password: password 
        })

    }).then(response => response.json()) // traducimos respuesta del backend
    .then(data => {
        // si backend devuelve status 'success'
        if (data.status === 'success') {
        console.log("Usuario logueado:", data.user);
        alert(`¡Pista libre! Bienvenido/a al club, ${data.user.nombre}.`);
        
        // aqui redireccion al dashboard en el futuro

        } else {
            // si backend devuelve un 401 y el json {"error": "Invalid credentials"}
            setErrorMsg(data.error);
        }

    }).catch(err => {
        console.error("Error en la petición:", err);
        setErrorMsg("Error de conexión con el servidor. Revisa Docker.");
    });
    };

    return (
    <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <div className="bg-[#262626] p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-[#FE0000]">
        
        <h2 className="text-3xl font-black text-white mb-6 text-center tracking-widest"> IANUARIUS </h2>

        {/* si hay error, mostramos aviso */}
        {errorMsg && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm text-center">
                {errorMsg}
            </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
            <label className="block text-[#9CA3AF] mb-1 text-sm">Email Address</label>
            <input type="email" 
                   className="w-full p-2 bg-[#171717] text-white border border-gray-600 rounded focus:border-[#FE0000] focus:outline-none"
                   placeholder="atleta@ianuarius.com"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)} 
                   required />
            </div>

            <div>
            <label className="block text-[#9CA3AF] mb-1 text-sm">Password</label>
            <input type="password" 
                   className="w-full p-2 bg-[#171717] text-white border border-gray-600 rounded focus:border-[#FE0000] focus:outline-none"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required />
            </div>

            <button type="submit" 
                    className="w-full bg-[#FE0000] text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300" >
                LOGIN
            </button>
            
        </form>
        
        </div>
    </div>
    );
}