import { useState } from 'react';
import { API } from '../api';

const inputClasses = "w-full p-2 bg-oscuro text-white border border-gray-600 rounded focus:border-ianuarius focus:outline-none text-sm";
const labelClasses = "block text-gray-400 mb-1 text-xs";

export default function Register({ onRegisterSuccess }) {
    const [form, setForm] = useState({
        nombre: '', apellidos: '', dni: '', email: '',
        fecha_nacimiento: '', genero: '', rol: 'Atleta',
        password: '', confirm_password: ''
    });
    const [errorMsg,   setErrorMsg]   = useState('');
    const [pendingMsg, setPendingMsg] = useState('');
    const [loading,    setLoading]    = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (form.password !== form.confirm_password) {
            setErrorMsg('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        fetch(`${API}/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre:           form.nombre,
                apellidos:        form.apellidos,
                dni:              form.dni,
                email:            form.email,
                fecha_nacimiento: form.fecha_nacimiento,
                genero:           form.genero,
                rol:              form.rol,
                password:         form.password
            })
        })
        .then(res => res.json())
        .then(data => {
            setLoading(false);
            if (data.status === 'success') {
                onRegisterSuccess(data.user);
            } else if (data.status === 'pending') {
                setPendingMsg(data.message);
            } else {
                setErrorMsg(data.error);
            }
        })
        .catch(() => {
            setLoading(false);
            setErrorMsg('Error de conexión');
        });
    };

    if (pendingMsg) {
        return (
            <div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-yellow-500 w-full text-center">
                <p className="text-yellow-400 text-sm font-bold mb-2">Registro completado</p>
                <p className="text-gray-400 text-xs leading-relaxed">{pendingMsg}</p>
            </div>
        );
    }

    return (
        <div className="bg-gris p-6 rounded-lg shadow-2xl border-t-4 border-ianuarius w-full">
            <h2 className="text-2xl font-black text-white mb-4 text-center tracking-widest">REGISTRO</h2>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-2 rounded mb-4 text-xs text-center">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Nombre</label>
                        <input type="text" name="nombre" className={inputClasses}
                               placeholder="Juan" value={form.nombre} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelClasses}>Apellidos</label>
                        <input type="text" name="apellidos" className={inputClasses}
                               placeholder="García López" value={form.apellidos} onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>DNI</label>
                        <input type="text" name="dni" className={inputClasses}
                               placeholder="12345678A" maxLength={9} value={form.dni} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelClasses}>Rol</label>
                        <select name="rol" className={inputClasses} value={form.rol} onChange={handleChange} required>
                            <option value="Atleta">Atleta</option>
                            <option value="Entrenador">Entrenador</option>
                        </select>
                    </div>
                </div>

                {form.rol === 'Entrenador' && (
                    <p className="text-yellow-500/80 text-[10px] bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2">
                        Las cuentas de Entrenador requieren activación por un administrador antes de poder acceder.
                    </p>
                )}

                <div>
                    <label className={labelClasses}>Email</label>
                    <input type="email" name="email" className={inputClasses}
                           placeholder="atleta@ianuarius.com" value={form.email} onChange={handleChange} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Fecha de nacimiento</label>
                        <input type="date" name="fecha_nacimiento" className={inputClasses}
                               value={form.fecha_nacimiento} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelClasses}>Género</label>
                        <select name="genero" className={inputClasses} value={form.genero} onChange={handleChange} required>
                            <option value="" disabled>Seleccionar</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Contraseña</label>
                    <input type="password" name="password" className={inputClasses}
                           placeholder="••••••••" value={form.password} onChange={handleChange} required />
                </div>

                <div>
                    <label className={labelClasses}>Confirmar contraseña</label>
                    <input type="password" name="confirm_password" className={inputClasses}
                           placeholder="••••••••" value={form.confirm_password} onChange={handleChange} required />
                </div>

                <button type="submit" disabled={loading}
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
