import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const EQUINOX_COMPANY_CODE = 0; // Código que identifica a Equinox

function getUserContext(req: Request) {
  // @ts-ignore
  const { userId, role, companyIds } = req.user;
  return {
    userId: userId as number,
    role: role as Role,
    companyIds: companyIds as number[]
  };
}

// CREATE
export const createUser = async (req: Request, res: Response) => {
  const { role, companyIds } = getUserContext(req);
  const { email, password, name, newRole, companyId } = req.body;

  if (!email || !password || !name || companyId === undefined) {
    return res.status(400).json({ error: 'Email, password, name e companyId são obrigatórios.' });
  }
  if (role === 'USER') {
    return res.status(403).json({ error: 'Acesso negado: USER não pode criar usuários.' });
  }
  if (role === 'SUPERUSER' && !companyIds.includes(Number(companyId))) {
    return res.status(403).json({ error: 'Acesso negado: não pode criar usuário fora da sua empresa.' });
  }

  // Determina o role a atribuir
  let roleToAssign: Role = 'USER';
  if (newRole === 'ADMIN') {
    if (role !== 'ADMIN') {
      return res.status(403).json({ error: 'Apenas ADMIN pode criar usuários ADMIN.' });
    }
    const equinox = await prisma.company.findUnique({ where: { code: EQUINOX_COMPANY_CODE } });
    if (!equinox || Number(companyId) !== equinox.id) {
      return res.status(403).json({ error: 'ADMIN só pode criar outro ADMIN vinculado à Equinox.' });
    }
    roleToAssign = 'ADMIN';
  } else if (newRole === 'SUPERUSER') {
    if (role === 'ADMIN' || role === 'SUPERUSER') {
      roleToAssign = 'SUPERUSER';
    } else {
      return res.status(403).json({ error: 'Acesso negado: não pode criar SUPERUSER.' });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: roleToAssign
      }
    });
    await prisma.userCompany.create({
      data: {
        userId: user.id,
        companyId: Number(companyId),
        isDefault: true
      }
    });
    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
};

// READ — list all
export const getUsers = async (req: Request, res: Response) => {
  const { role, companyIds, userId: me } = getUserContext(req);

  try {
    let users;
    if (role === 'ADMIN') {
      users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
    } else if (role === 'SUPERUSER') {
      users = await prisma.user.findMany({
        where: { companies: { some: { companyId: { in: companyIds } } } },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            where: { companyId: { in: companyIds } },
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
    } else {
      // USER: só retorna a si próprio
      const u = await prisma.user.findUnique({
        where: { id: me },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
      users = u ? [u] : [];
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
  }
};

// READ — by id
export const getUserById = async (req: Request, res: Response) => {
  const { role, companyIds, userId: me } = getUserContext(req);
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuário inválido.' });
  }

  try {
    let user;
    if (role === 'ADMIN') {
      user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
    } else if (role === 'SUPERUSER') {
      user = await prisma.user.findFirst({
        where: { id, companies: { some: { companyId: { in: companyIds } } } },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            where: { companyId: { in: companyIds } },
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
      if (!user) {
        return res.status(403).json({ error: 'Acesso negado a este usuário.' });
      }
    } else {
      if (id !== me) {
        return res.status(403).json({ error: 'Acesso negado: só pode ver seu próprio perfil.' });
      }
      user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          companies: {
            select: {
              isDefault: true,
              company: { select: { id: true, name: true, code: true } }
            }
          }
        }
      });
    }
    if (!user) {
      return res
        .status(role === 'ADMIN' ? 404 : 403)
        .json({ error: role === 'ADMIN' ? 'Usuário não encontrado.' : 'Acesso negado a este usuário.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Erro ao buscar usuário ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
  }
};

// UPDATE
export const updateUser = async (req: Request, res: Response) => {
  const { role, companyIds, userId: me } = getUserContext(req);
  const id = Number(req.params.id);
  const { email, password, name, newRole, companyId } = req.body;

  if (isNaN(id) || (!email && !password && !name && newRole === undefined)) {
    return res.status(400).json({ error: 'ID inválido ou nenhum campo para atualizar.' });
  }
  if (newRole && id === me) {
    return res.status(403).json({ error: 'Você não pode alterar seu próprio role.' });
  }

  if (role === 'SUPERUSER') {
    const assoc = await prisma.userCompany.findFirst({
      where: { userId: id, companyId: { in: companyIds } }
    });
    if (!assoc) {
      return res.status(403).json({ error: 'Acesso negado: não pode editar este usuário.' });
    }
  } else if (role === 'USER') {
    if (id !== me || newRole) {
      return res
        .status(403)
        .json({ error: 'USER só pode editar seu próprio perfil sem alterar role.' });
    }
  }

  if (newRole) {
    if (newRole === 'ADMIN') {
      if (role !== 'ADMIN') {
        return res.status(403).json({ error: 'Apenas ADMIN pode promover para ADMIN.' });
      }
      const equinox = await prisma.company.findUnique({ where: { code: EQUINOX_COMPANY_CODE } });
      const targetAssoc = await prisma.userCompany.findFirst({
        where: { userId: id, companyId: equinox?.id }
      });
      if (!targetAssoc) {
        return res
          .status(403)
          .json({ error: 'Só pode promover para ADMIN usuários vinculados à Equinox.' });
      }
    } else if (newRole === 'SUPERUSER') {
      if (role === 'USER') {
        return res.status(403).json({ error: 'USER não pode promover para SUPERUSER.' });
      }
    } else if (newRole === 'USER') {
      if (role === 'USER') {
        return res.status(403).json({ error: 'USER não pode alterar role.' });
      }
    }
  }

  try {
    const data: any = {};
    if (email) data.email = email;
    if (name) data.name = name;
    if (password) data.password = await bcrypt.hash(password, 10);
    if (newRole && (role === 'ADMIN' || role === 'SUPERUSER')) {
      data.role = newRole;
    }

    if (companyId !== undefined && role === 'ADMIN') {
      await prisma.userCompany.updateMany({
        where: { userId: id },
        data: { isDefault: false }
      });
      await prisma.userCompany.upsert({
        where: { userId_companyId: { userId: id, companyId: Number(companyId) } },
        update: { isDefault: true },
        create: { userId: id, companyId: Number(companyId), isDefault: true }
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error(`Erro ao atualizar usuário ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
  }
};

// DELETE
export const deleteUser = async (req: Request, res: Response) => {
  const { role, companyIds } = getUserContext(req);
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID de usuário inválido.' });
  }
  if (role === 'USER') {
    return res.status(403).json({ error: 'USER não pode excluir usuários.' });
  }
  if (role === 'SUPERUSER') {
    const assoc = await prisma.userCompany.findFirst({
      where: { userId: id, companyId: { in: companyIds } }
    });
    if (!assoc) {
      return res.status(403).json({ error: 'SUPERUSER não pode excluir este usuário.' });
    }
  }

  try {
    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error(`Erro ao excluir usuário ${id}:`, error);
    return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
  }
};
