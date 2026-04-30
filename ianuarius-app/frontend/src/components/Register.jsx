import { useState } from 'react';

export default function Register({ onRegisterSuccess }) {
    const [form, setForm] = useState({
        nombre: '',
        apellidos: '',
        email: '',
        fecha_nacimiento: '',
        genero: '',
        password: '',
        confirm_password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (form.password !== form.confirm_password) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        fetch('/api/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: form.nombre,
                apellidos: form.apellidos,
                email: form.email,
                fecha_nacimiento: form.fecha_nacimiento,
                genero: form.genero,
                password: form.password
            })
        })
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            if (data.status === 'success') {
                onRegisterSuccess(data.user);
            } else {
                setErrorMsg(data.error);
            }
        })
        .catch(() => {
            setLoading(false);
            setErrorMsg('Error de conexión');
        });
    };

    return (
        <div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
            <h2 className="text-2xl font-black text-white mb-4 text-center tracking-widest">
                REGISTRO
            </h2>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-gray-400 mb-1 text-xs">Nombre</label>
                        <input type="text" name="nombre"
                               className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                               placeholder="Juan"
                               value={form.nombre}
                               onChange={handleChange}
                               required />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-xs">Apellidos</label>
                        <input type="text" name="apellidos"
                               className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                               placeholder="García López"
                               value={form.apellidos}
                               onChange={handleChange}
                               required />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 mb-1 text-xs">Email</label>
                    <input type="email" name="email"
                           className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                           placeholder="atleta@ianuarius.com"
                           value={form.email}
                           onChange={handleChange}
                           required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-gray-400 mb-1 text-xs">Fecha de nacimiento</label>
                        <input type="date" name="fecha_nacimiento"
                               className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                               value={form.fecha_nacimiento}
                               onChange={handleChange}
                               required />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-xs">Género</label>
                        <select name="genero"
                                className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                                value={form.genero}
                                onChange={handleChange}
                                required>
                            <option value="" disabled>Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-gray-400 mb-1 text-xs">Contraseña</label>
                    <input type="password" name="password"
                           className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                           placeholder="••••••••"
                           value={form.password}
                           onChange={handleChange}
                           required />
                </div>

                <div>
                    <label className="block text-gray-400 mb-1 text-xs">Confirmar contraseña</label>
                    <input type="password" name="confirm_password"
                           className="w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm"
                           placeholder="••••••••"
                           value={form.confirm_password}
                           onChange={handleChange}
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
                    {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                </button>
            </form>
        </div>
    );
}
