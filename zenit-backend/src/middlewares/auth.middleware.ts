// zenit-backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export async function authMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verifica o token com o core-backend
    const userInfo = await AuthService.verifyToken(token);
    
    if (!userInfo) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Salva as informações do usuário para uso nos controllers
    req.user = userInfo;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Erro ao validar token' });
  }
}