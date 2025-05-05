// zenit-backend/src/middlewares/tenant.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = req;
  
  // Se não há usuário autenticado, bloqueia
  if (!user) {
    return res.status(401).json({
      error: 'Usuário não autenticado'
    });
  }
  
  // Tenta obter companyId de diferentes locais
  let companyId = req.params.companyId || (req.body && req.body.companyId) || req.query.companyId;
  
  // Se não há companyId na requisição, usa o primeiro do array do usuário
  if (!companyId && user.companyIds && user.companyIds.length > 0) {
    companyId = user.companyIds[0].toString();
  }
  
  // Se ainda não há companyId, bloqueia
  if (!companyId) {
    return res.status(403).json({
      error: 'Empresa não definida'
    });
  }
  
  // Converte para número para comparação
  const companyIdNum = Number(companyId);
  
  // Verifica se o usuário tem acesso a esta empresa
  if (!AuthService.hasAccess(user, companyIdNum)) {
    return res.status(403).json({
      error: 'Acesso negado: você não tem permissão para acessar esta empresa'
    });
  }
  
  // Adiciona o companyId ao req para uso nos controllers
  (req as any).currentCompanyId = companyIdNum;
  
  next();
}