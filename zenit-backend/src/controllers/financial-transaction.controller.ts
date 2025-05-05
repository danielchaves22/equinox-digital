// zenit-backend/src/controllers/financial-transaction.controller.ts
import { Request, Response } from 'express';
import { FinancialTransactionService } from '../services/financial-transaction.service';
import { logger } from '../utils/logger';

export class FinancialTransactionController {
  /**
   * Cria uma nova transação financeira
   * POST /api/financial-transactions
   */
  static async createFinancialTransaction(req: Request, res: Response) {
    try {
      const {
        description,
        amount,
        date,
        type,
        status,
        accountId,
        categoryId,
        notes
      } = req.body;
      
      const { userId } = req.user!;
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      // Validação básica
      if (!description || !amount || !date || !type || !status || !accountId) {
        return res.status(400).json({
          error: 'Dados incompletos. Descrição, valor, data, tipo, status e conta são obrigatórios.'
        });
      }
      
      // Validar tipo
      if (!['income', 'expense', 'transfer'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income, expense ou transfer' });
      }
      
      // Validar status
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status deve ser pending, completed ou cancelled' });
      }
      
      const transaction = await FinancialTransactionService.createFinancialTransaction({
        description,
        amount: Number(amount),
        date: new Date(date),
        type,
        status,
        accountId: Number(accountId),
        categoryId: categoryId ? Number(categoryId) : undefined,
        companyId,
        userId,
        notes
      });
      
      return res.status(201).json(transaction);
    } catch (error) {
      logger.error('Erro ao criar transação financeira:', error);
      return res.status(500).json({ error: 'Erro ao criar transação financeira' });
    }
  }
  
  /**
   * Lista transações financeiras com filtros
   * GET /api/financial-transactions
   */
  static async listFinancialTransactions(req: Request, res: Response) {
    try {
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      // Extrair e converter filtros
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const accountId = req.query.accountId ? Number(req.query.accountId) : undefined;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const type = req.query.type as string | undefined;
      const status = req.query.status as string | undefined;
      
      // Validar tipo se fornecido
      if (type && !['income', 'expense', 'transfer'].includes(type)) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }
      
      // Validar status se fornecido
      if (status && !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }
      
      const transactions = await FinancialTransactionService.listFinancialTransactions(
        companyId,
        {
          startDate,
          endDate,
          accountId,
          categoryId,
          type,
          status
        }
      );
      
      return res.status(200).json(transactions);
    } catch (error) {
      logger.error('Erro ao listar transações financeiras:', error);
      return res.status(500).json({ error: 'Erro ao listar transações financeiras' });
    }
  }
  
  /**
   * Busca uma transação financeira pelo ID
   * GET /api/financial-transactions/:id
   */
  static async getFinancialTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const transaction = await FinancialTransactionService.getFinancialTransaction(id, companyId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transação financeira não encontrada' });
      }
      
      return res.status(200).json(transaction);
    } catch (error) {
      logger.error(`Erro ao buscar transação financeira:`, error);
      return res.status(500).json({ error: 'Erro ao buscar transação financeira' });
    }
  }
  
  /**
   * Atualiza uma transação financeira
   * PUT /api/financial-transactions/:id
   */
  static async updateFinancialTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      const {
        description,
        amount,
        date,
        type,
        status,
        accountId,
        categoryId,
        notes
      } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      // Garantir que ao menos um campo foi fornecido
      if (!description && amount === undefined && !date && !type && 
          !status && accountId === undefined && categoryId === undefined && !notes) {
        return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
      }
      
      // Validar tipo se fornecido
      if (type && !['income', 'expense', 'transfer'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income, expense ou transfer' });
      }
      
      // Validar status se fornecido
      if (status && !['pending', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status deve ser pending, completed ou cancelled' });
      }
      
      // Buscar transação original para atualizações de saldo
      const original = await FinancialTransactionService.getFinancialTransaction(id, companyId);
      
      if (!original) {
        return res.status(404).json({ error: 'Transação financeira não encontrada' });
      }
      
      const updated = await FinancialTransactionService.updateFinancialTransaction(
        id,
        companyId,
        {
          description,
          amount: amount !== undefined ? Number(amount) : undefined,
          date: date ? new Date(date) : undefined,
          type,
          status,
          accountId: accountId !== undefined ? Number(accountId) : undefined,
          categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : undefined,
          notes
        },
        original
      );
      
      return res.status(200).json(updated);
    } catch (error) {
      logger.error(`Erro ao atualizar transação financeira:`, error);
      return res.status(500).json({ error: 'Erro ao atualizar transação financeira' });
    }
  }
  
  /**
   * Remove uma transação financeira
   * DELETE /api/financial-transactions/:id
   */
  static async deleteFinancialTransaction(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      await FinancialTransactionService.deleteFinancialTransaction(id, companyId);
      return res.status(204).send();
    } catch (error) {
      logger.error(`Erro ao excluir transação financeira:`, error);
      return res.status(500).json({ error: 'Erro ao excluir transação financeira' });
    }
  }
}