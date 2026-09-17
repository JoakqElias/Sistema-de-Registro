import { useState } from 'react'
import type { Producto } from '../types/Producto'

interface Props {
  producto: Producto
}

function ImagenProducto({ url, nombre }: { url: string; nombre: string }) {
  const [fallo, setFallo] = useState(false)
  if (!url || fallo) {
    return <div className="imagen-vacia"><span aria-hidden="true">◇</span><p>Sin imagen disponible</p></div>
  }
  return <img src={url} alt={nombre || 'Imagen del producto'} onError={() => setFallo(true)} />
}

export default function TarjetaProducto({ producto }: Props) {
  return (
    <article className="tarjeta-producto" aria-label="Vista previa del producto">
      <div className="imagen-producto">
        <ImagenProducto key={producto.imagen} url={producto.imagen} nombre={producto.nombre} />
        <span className={`estado-stock ${producto.stock > 0 ? '' : 'sin-stock'}`}>
          {producto.stock > 0 ? 'Disponible' : 'Sin stock'}
        </span>
      </div>
      <div className="contenido-tarjeta">
        <p className="codigo-producto">{producto.codigo || 'CÓDIGO DEL PRODUCTO'}</p>
        <h3>{producto.nombre || 'Nombre del producto'}</h3>
        <p className="descripcion-producto">{producto.descripcion || 'La descripción del producto aparecerá aquí.'}</p>
        <dl className="detalles-producto">
          <div><dt>Talle</dt><dd>{producto.talle || 'Sin especificar'}</dd></div>
          <div><dt>Stock</dt><dd>{producto.stock} unidades</dd></div>
        </dl>
        <p className="precio-producto">
          {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(producto.precio)}
        </p>
      </div>
    </article>
  )
}
