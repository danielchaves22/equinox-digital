import { Request, Response } from 'express';

export const createCompany = async (req: Request, res: Response) => {
  const { name, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'O campo nome é obrigatório.' });
  }
  res.status(201).json({ message: 'Empresa criada com sucesso.', company: { name, address } });
};

export const listCompanies = async (req: Request, res: Response) => {
  res.json({ message: 'Lista de empresas' });
};
