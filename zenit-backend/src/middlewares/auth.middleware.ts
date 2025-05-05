// zenit-backend/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export async function authMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Verifica o token com o core-backend
    const userInfo = await AuthService.verifyToken(token);
    
    console.log('userInfo:', userInfo);
    
    if (!userInfo) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // Salva as informações do usuário para uso nos controllers
    req.user = userInfo;
    console.log('req.user after assignment:', req.user);
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Erro ao validar token' });
  }
}