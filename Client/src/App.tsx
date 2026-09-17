import { useEffect, useState } from 'react'
import Autenticacion from './components/Autenticacion'
import type { Sesion } from './types/Sesion'
import FormularioProducto from './components/FormularioProducto'
import TarjetaProducto from './components/TarjetaProducto'
import type { Producto } from './types/Producto'

const productoVacio: Producto = {
  codigo: '', nombre: '', descripcion: '', talle: '', precio: 0, stock: 0, imagen: '',
}

function App() {
  // La sesión vive en memoria: no guardamos tokens ni contraseñas en localStorage.
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [producto, setProducto] = useState<Producto>({ ...productoVacio })
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    if (!sesion) return
    const timer = window.setTimeout(() => setSesion(null), sesion.expiresIn * 1000)
    return () => window.clearTimeout(timer)
  }, [sesion])

  if (!sesion) return <Autenticacion onLogin={value => {
    setProducto({ ...productoVacio }); setMensaje(''); setSesion(value)
  }} />

  return (
    <div className="aplicacion">
      <header className="cabecera"><span className="marca">URBANS<span>.</span></span><div className="usuario-cabecera"><span className="etiqueta-cabecera">{sesion.usuario.nombre}</span><button type="button" className="enlace-auth" onClick={() => setSesion(null)}>Cerrar sesión</button></div></header>
      <main>
        <div className="encabezado-pagina"><p className="sobretitulo">PRODUCTOS</p><h1>Creá tu próxima tarjeta.</h1><p>Completá los datos y mirá cómo queda tu producto.</p></div>
        <div className="distribucion-productos">
          <FormularioProducto producto={producto}
            onChange={value => { setProducto(value); setMensaje('') }}
            onReset={() => { setProducto({ ...productoVacio }); setMensaje('') }}
            onSubmit={value => { setProducto(value); setMensaje('Datos válidos. La tarjeta está lista en la vista previa.') }} />
          <section className="panel-preview" aria-labelledby="titulo-preview">
            <div className="titulo-seccion"><span className="numero-seccion">02</span><div><h2 id="titulo-preview">Vista previa</h2><p>Se actualiza mientras escribís.</p></div></div>
            <TarjetaProducto producto={producto} />
            <p className="nota-preview">Vista previa local. Los datos no se guardan en la base de datos.</p>
          </section>
        </div>
        <p role="status" className={mensaje ? 'mensaje-exito' : ''}>{mensaje}</p>
      </main>
    </div>
  )
}

export default App
