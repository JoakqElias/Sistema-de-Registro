import type { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../Services/Token';

export function requerirAutenticacion(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debe iniciar sesión para continuar' });
  }
  try {
    res.locals.usuarioId = verificarToken(authorization.slice(7));
    return next();
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o vencida' });
  }
}
