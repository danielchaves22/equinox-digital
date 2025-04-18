import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extrai do req.user o campo `role` já tipado como string.
 */
function getUserContext(req: Request): { role: string } {
  // @ts-ignore
  const role = req.user.role as string;
  return { role };
}

// CREATE — agora auto‑incrementa `code` pela aplicação
export const createCompany = async (req: Request, res: Response) => {
  const { role } = getUserContext(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: apenas ADMIN pode criar empresas.' });
  }

  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'O campo name é obrigatório.' });
  }

  try {
    // 1) Busca o maior code existente
    const result = await prisma.company.aggregate({
      _max: { code: true }
    });
    const maxCode = result._max.code ?? -1;
    const nextCode = maxCode + 1;

    // 2) Cria a nova empresa com code = nextCode
    const company = await prisma.company.create({
      data: {
        name,
        address,
        code: nextCode
      }
    });

    return res.status(201).json(company);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return res.status(500).json({ error: 'Erro interno ao criar empresa.' });
  }
};

// READ (list)
export const listCompanies = async (req: Request, res: Response) => {
  const { role } = getUserContext(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: apenas ADMIN pode listar empresas.' });
  }

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        code: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { code: 'asc' }
    });
    return res.status(200).json(companies);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return res.status(500).json({ error: 'Erro interno ao listar empresas.' });
  }
};

// UPDATE
export const updateCompany = async (req: Request, res: Response) => {
  const { role } = getUserContext(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: apenas ADMIN pode editar empresas.' });
  }

  const id = Number(req.params.id);
  const { name, address } = req.body;
  if (isNaN(id) || (name === undefined && address === undefined)) {
    return res.status(400).json({ error: 'ID inválido ou nenhum campo para atualizar.' });
  }

  try {
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(address !== undefined ? { address } : {})
      }
    });
    return res.status(200).json(company);
  } catch (error) {
    console.error(`Erro ao atualizar empresa ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno ao atualizar empresa.' });
  }
};

// DELETE
export const deleteCompany = async (req: Request, res: Response) => {
  const { role } = getUserContext(req);
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso negado: apenas ADMIN pode excluir empresas.' });
  }

  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de empresa inválido.' });
  }

  try {
    await prisma.company.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(`Erro ao excluir empresa ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno ao excluir empresa.' });
  }
};
