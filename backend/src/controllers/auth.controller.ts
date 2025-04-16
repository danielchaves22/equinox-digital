import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/jwt';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  const { email, password, name, companyId } = req.body;

  // Validação de campos obrigatórios
  if (!email || !password || !name || !companyId) {
    return res.status(400).json({ error: 'Email, password, name e companyId são obrigatórios.' });
  }

  try {
    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Usuário já existe.' });
    }

    // Valida se a empresa existe
    const company = await prisma.company.findUnique({ where: { id: Number(companyId) } });
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }

    // Cria o usuário com a senha hasheada
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });

    // Cria a associação entre usuário e empresa na tabela userCompany
    await prisma.userCompany.create({
      data: { userId: user.id, companyId: Number(companyId) }
    });

    // Busca as associações de empresas do usuário para incluir os companyIds no token
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: user.id },
      select: { companyId: true }
    });
    const companyIds = userCompanies.map((uc: { companyId: number }) => uc.companyId);

    // Gera o token JWT com userId e companyIds
    const token = generateToken({ userId: user.id, companyIds });

    return res.status(201).json({ token, message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
  }
}

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

    // Busca as associações de empresas para incluir os companyIds no token
    const userCompanies = await prisma.userCompany.findMany({
      where: { userId: user.id },
      select: { companyId: true }
    });
    const companyIds = userCompanies.map((uc: { companyId: number }) => uc.companyId);

    const token = generateToken({ userId: user.id, companyIds });
    return res.status(200).json({ token, message: 'Login realizado com sucesso!' });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar login.' });
  }
}
