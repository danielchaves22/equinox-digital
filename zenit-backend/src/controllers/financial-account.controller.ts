// zenit-backend/src/controllers/financial-account.controller.ts
import { Request, Response } from 'express';
import { FinancialAccountService } from '../services/financial-account.service';
import { logger } from '../utils/logger';

export class FinancialAccountController {
  /**
   * Cria uma nova conta financeira
   * POST /api/financial-accounts
   */
  static async createFinancialAccount(req: Request, res: Response) {
    try {
      const { name, type, balance, accountNumber, bankName } = req.body;
      const { userId, companyIds } = req.user!;
      const companyId = Number(req.body.companyId || companyIds[0]);
      
      // Validação básica
      if (!name || !type || balance === undefined) {
        return res.status(400).json({ error: 'Dados incompletos. Nome, tipo e saldo são obrigatórios.' });
      }
      
      const account = await FinancialAccountService.createFinancialAccount({
        name,
        type,
        balance: Number(balance),
        accountNumber,
        bankName,
        companyId,
        userId
      });
      
      return res.status(201).json(account);
    } catch (error) {
      logger.error('Erro ao criar conta financeira:', error);
      return res.status(500).json({ error: 'Erro ao criar conta financeira' });
    }
  }
  
  /**
   * Lista todas as contas financeiras
   * GET /api/financial-accounts
   */
  static async listFinancialAccounts(req: Request, res: Response) {
    try {
      const { companyIds } = req.user!;
      const companyId = Number(req.query.companyId || companyIds[0]);
      
      const accounts = await FinancialAccountService.listFinancialAccounts(companyId);
      return res.status(200).json(accounts);
    } catch (error) {
      logger.error('Erro ao listar contas financeiras:', error);
      return res.status(500).json({ error: 'Erro ao listar contas financeiras' });
    }
  }
  
  /**
   * Busca uma conta financeira pelo ID
   * GET /api/financial-accounts/:id
   */
  static async getFinancialAccount(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { companyIds } = req.user!;
      const companyId = Number(req.query.companyId || companyIds[0]);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const account = await FinancialAccountService.getFinancialAccount(id, companyId);
      
      if (!account) {
        return res.status(404).json({ error: 'Conta financeira não encontrada' });
      }
      
      return res.status(200).json(account);
    } catch (error) {
      logger.error(`Erro ao buscar conta financeira:`, error);
      return res.status(500).json({ error: 'Erro ao buscar conta financeira' });
    }
  }
  
  /**
   * Atualiza uma conta financeira
   * PUT /api/financial-accounts/:id
   */
  static async updateFinancialAccount(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { companyIds } = req.user!;
      const companyId = Number(req.body.companyId || companyIds[0]);
      const { name, type, balance, accountNumber, bankName, isActive } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      // Garantir que ao menos um campo foi fornecido
      if (!name && type === undefined && balance === undefined && 
          accountNumber === undefined && bankName === undefined && isActive === undefined) {
        return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
      }
      
      await FinancialAccountService.updateFinancialAccount(id, companyId, {
        name,
        type,
        balance: balance !== undefined ? Number(balance) : undefined,
        accountNumber,
        bankName,
        isActive
      });
      
      return res.status(200).json({ message: 'Conta financeira atualizada com sucesso' });
    } catch (error) {
      logger.error(`Erro ao atualizar conta financeira:`, error);
      return res.status(500).json({ error: 'Erro ao atualizar conta financeira' });
    }
  }
  
  /**
   * Remove uma conta financeira
   * DELETE /api/financial-accounts/:id
   */
  static async deleteFinancialAccount(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { companyIds } = req.user!;
      const companyId = Number(req.query.companyId || companyIds[0]);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      await FinancialAccountService.deleteFinancialAccount(id, companyId);
      return res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao excluir conta financeira:`, error);
      
      if (error.message?.includes('transações vinculadas')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro ao excluir conta financeira' });
    }
  }
}