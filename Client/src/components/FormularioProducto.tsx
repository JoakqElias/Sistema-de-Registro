import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Producto } from '../types/Producto'

interface Props {
  producto: Producto
  onChange: (producto: Producto) => void
  onSubmit: (producto: Producto) => void
  onReset: () => void
}

export default function FormularioProducto({ producto, onChange, onSubmit, onReset }: Props) {
  const [error, setError] = useState('')

  function actualizar<K extends keyof Producto>(campo: K, valor: Producto[K]) {
    setError('')
    onChange({ ...producto, [campo]: valor })
  }

  function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!producto.codigo.trim() || !producto.nombre.trim()) {
      setError('Completá el código y el nombre del producto.')
      return
    }
    if (!Number.isFinite(producto.precio) || producto.precio < 0 || producto.precio > 99999999.99 ||
        !Number.isInteger(producto.stock) || producto.stock < 0 || producto.stock > 2147483647) {
      setError('Ingresá un precio válido y un stock entero, ambos mayores o iguales a cero.')
      return
    }
    if (producto.imagen && !/^https?:\/\//i.test(producto.imagen)) {
      setError('La imagen debe ser una URL que empiece con http:// o https://.')
      return
    }
    onSubmit({ ...producto, codigo: producto.codigo.trim(), nombre: producto.nombre.trim() })
  }

  return (
    <form className="formulario-producto" onSubmit={enviar}>
      <div className="titulo-seccion"><span className="numero-seccion">01</span><div><h2>Datos del producto</h2><p>Los campos con * son obligatorios.</p></div></div>
      <div className="campos-dobles">
        <label htmlFor="codigo">Código *<input id="codigo" name="codigo" value={producto.codigo} onChange={e => actualizar('codigo', e.target.value)} placeholder="Ej.: REM-001" required maxLength={50} /></label>
        <label htmlFor="talle">Talle<input id="talle" name="talle" value={producto.talle} onChange={e => actualizar('talle', e.target.value)} placeholder="Ej.: M, 42, único" maxLength={20} /></label>
      </div>
      <label htmlFor="nombre">Nombre *<input id="nombre" name="nombre" value={producto.nombre} onChange={e => actualizar('nombre', e.target.value)} placeholder="Ej.: Remera de algodón" required maxLength={150} /></label>
      <label htmlFor="descripcion">Descripción<textarea id="descripcion" name="descripcion" value={producto.descripcion} onChange={e => actualizar('descripcion', e.target.value)} placeholder="Material, color y detalles del producto…" rows={4} /></label>
      <div className="campos-dobles">
        <label htmlFor="precio">Precio (ARS)<input id="precio" name="precio" type="number" min="0" max="99999999.99" step="0.01" value={producto.precio} onChange={e => actualizar('precio', Number(e.target.value))} /></label>
        <label htmlFor="stock">Stock<input id="stock" name="stock" type="number" min="0" max="2147483647" step="1" value={producto.stock} onChange={e => actualizar('stock', Number(e.target.value))} /></label>
      </div>
      <label htmlFor="imagen">URL de la imagen<input id="imagen" name="imagen" type="url" pattern="https?://.*" value={producto.imagen} onChange={e => actualizar('imagen', e.target.value)} placeholder="https://ejemplo.com/producto.jpg" maxLength={255} aria-describedby="ayuda-imagen" /></label>
      <p id="ayuda-imagen" className="ayuda">Usá el enlace directo a una imagen del producto.</p>
      {error && <p role="alert" className="error-formulario">{error}</p>}
      <div className="acciones-formulario">
        <button className="boton-secundario" type="button" onClick={() => { setError(''); onReset() }}>Limpiar</button>
        <button className="boton-principal" type="submit">Validar producto <span aria-hidden="true">→</span></button>
      </div>
    </form>
  )
}
