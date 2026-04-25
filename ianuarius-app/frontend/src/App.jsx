import { useState, useEffect } from 'react'

function App() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Llamada al backend
    fetch('/api/test.php')
      .then(respuesta => respuesta.json())
      .then(datos => {
        if (datos.status === 'success') {
          setUsuarios(datos.data)
        }
        setCargando(false)
      })
      .catch(error => {
        console.error("Error:", error)
        setCargando(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#171717] p-10 font-sans">
      <h1 className="text-4xl text-[#FE0000] font-black mb-6 tracking-widest">
        IANUARIUS - TEST DB
      </h1>
      
      {cargando ? (
        <p className="text-white">Cargando atletas...</p>
      ) : (
        <div className="grid gap-4">
          {usuarios.map(usuario => (
            <div key={usuario.id_usuario} className="bg-[#262626] p-4 rounded-lg border-l-4 border-[#FE0000]">
              <h2 className="text-white font-bold text-lg">{usuario.nombre} {usuario.apellidos}</h2>
              <p className="text-gray-400">{usuario.email} | Rol: {usuario.rol}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App