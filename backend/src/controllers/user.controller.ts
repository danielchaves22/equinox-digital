import { Request, Response } from 'express';

export const getUsers = async (req: Request, res: Response) => {
  res.json({ message: 'Lista de usuários' });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ message: `Detalhes do usuário ${id}` });
};
