export interface Sesion {
  token: string
  expiresIn: number
  usuario: { id: number; nombre: string; email: string }
}
