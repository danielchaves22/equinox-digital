// zenit-backend/src/middlewares/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req;
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  // Se não há ID de empresa na requisição, prossegue
  if (!companyId) {
    return next();
  }
  
  // Converte para número para comparação
  const companyIdNum = Number(companyId);
  
  // Verifica se o usuário tem acesso a esta empresa
  if (!user || !AuthService.hasAccess(user, companyIdNum)) {
    return res.status(403).json({
      error: 'Acesso negado: você não tem permissão para acessar esta empresa'
    });
  }
  
  next();
}