import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Sesion } from '../types/Sesion'

export default function Autenticacion({ onLogin }: { onLogin: (sesion: Sesion) => void }) {
  const [registro, setRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (enviando) return
    setError('')
    setMensaje('')
    if (new TextEncoder().encode(password).length > 72) {
      setError('La contraseña no puede superar 72 bytes; algunos caracteres ocupan más de un byte.')
      return
    }
    setEnviando(true)
    try {
      const response = await fetch(`/api/auth/${registro ? 'registro' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(registro ? { nombre } : {}) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud.')
      setPassword('')
      if (registro) {
        setRegistro(false)
        setMensaje('Cuenta creada. Iniciá sesión con tu correo y contraseña.')
      } else {
        onLogin(data as Sesion)
      }
    } catch (err) {
      setError(err instanceof SyntaxError || err instanceof TypeError
        ? 'No se pudo conectar con el servidor. Comprobá que el backend esté iniciado.'
        : err instanceof Error ? err.message : 'No se pudo completar la solicitud.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="pagina-auth">
      <p className="sobretitulo">URBANS · PRODUCTOS</p>
      <h1>{registro ? 'Creá tu cuenta.' : 'Bienvenido de nuevo.'}</h1>
      <p>{registro ? 'Registrate para acceder al sistema.' : 'Iniciá sesión para continuar.'}</p>
      <form className="formulario-producto" onSubmit={enviar}>
        {registro && <label htmlFor="auth-nombre">Nombre<input id="auth-nombre" autoComplete="name" value={nombre} onChange={e => setNombre(e.target.value)} required maxLength={100} disabled={enviando} /></label>}
        <label htmlFor="auth-email">Correo electrónico<input id="auth-email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} disabled={enviando} /></label>
        <label htmlFor="auth-password">Contraseña<input id="auth-password" type="password" autoComplete={registro ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} disabled={enviando} aria-describedby="ayuda-password" /></label>
        <p className="ayuda" id="ayuda-password">Mínimo 8 caracteres. Máximo 72 bytes.</p>
        {error && <p role="alert" className="error-formulario">{error}</p>}
        {mensaje && <p role="status" className="mensaje-exito">{mensaje}</p>}
        <div className="acciones-formulario">
          <button type="submit" className="boton-principal" disabled={enviando}>{enviando ? 'Procesando…' : registro ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </div>
        <button type="button" className="enlace-auth" disabled={enviando} onClick={() => {
          setRegistro(!registro); setPassword(''); setError(''); setMensaje('')
        }}>{registro ? 'Ya tengo cuenta: iniciar sesión' : 'No tengo cuenta: registrarme'}</button>
      </form>
    </main>
  )
}
