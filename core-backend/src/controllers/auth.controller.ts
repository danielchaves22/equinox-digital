import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';

/**
 * Registro desabilitado via API pública.
 */
export async function register(req: Request, res: Response) {
  return res
    .status(403)
    .json({ error: 'Registro de usuários desabilitado. Use POST /api/users com permissão adequada.' });
}

/**
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password são obrigatórios.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: user.id },
      select: { companyId: true }
    });
    const companyIds = userCompanies.map((uc: { companyId: number }) => uc.companyId);

    // @ts-ignore
    const role = user.role;
    const token = generateToken({ userId: user.id, companyIds, role });

    return res.status(200).json({ token, message: 'Login realizado com sucesso!' });
  } catch (error) {
    logger.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}

// core-backend/src/controllers/auth.controller.ts (adicionar o seguinte método)

/**
 * GET /api/auth/verify
 * Endpoint para verificar validade de token JWT
 * Utilizado por outros serviços no ambiente de microserviços
 */
export async function verifyToken(req: Request, res: Response) {
  // O token já foi verificado pelo middleware de autenticação
  // Portanto, req.user já contém os dados decodificados do token
  
  // Retornar apenas as informações necessárias
  const userInfo = {
    userId: req.user?.id,
    role: req.user?.role,
    companyIds: req.user?.companyIds || []
  };
  
  return res.status(200).json(userInfo);
}