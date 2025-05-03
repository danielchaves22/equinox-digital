// zenit-backend/src/services/financial-transaction.service.ts
import { prisma } from '../lib/prisma-client';
import { logger } from '../utils/logger';

export class FinancialTransactionService {
  /**
   * Cria uma nova transação financeira
   */
  static async createFinancialTransaction(data: {
    description: string;
    amount: number;
    date: Date;
    type: string;
    status: string;
    accountId: number;
    categoryId?: number;
    companyId: number;
    userId: number;
    notes?: string;
  }) {
    try {
      // Iniciar transação no banco
      return await prisma.$transaction(async (tx) => {
        // Criar a transação
        const transaction = await tx.financialTransaction.create({
          data
        });
        
        // Atualizar o saldo da conta
        if (data.status === 'completed') {
          const multiplier = data.type === 'income' ? 1 : -1;
          await tx.financialAccount.update({
            where: { id: data.accountId },
            data: {
              balance: {
                increment: data.amount * multiplier
              }
            }
          });
        }
        
        return transaction;
      });
    } catch (error) {
      logger.error('Erro ao criar transação financeira:', error);
      throw error;
    }
  }

  /**
   * Lista transações financeiras com filtros
   */
  static async listFinancialTransactions(
    companyId: number, 
    filters: {
      startDate?: Date;
      endDate?: Date;
      accountId?: number;
      categoryId?: number;
      type?: string;
      status?: string;
    }
  ) {
    try {
      // Construir o filtro base
      const where: any = { companyId };
      
      // Adicionar filtros opcionais
      if (filters.startDate) {
        where.date = { gte: filters.startDate };
      }
      
      if (filters.endDate) {
        where.date = { ...where.date, lte: filters.endDate };
      }
      
      if (filters.accountId) {
        where.accountId = filters.accountId;
      }
      
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }
      
      if (filters.type) {
        where.type = filters.type;
      }
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      return await prisma.financialTransaction.findMany({
        where,
        include: {
          account: {
            select: {
              name: true
            }
          },
          category: {
            select: {
              name: true,
              color: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });
    } catch (error) {
      logger.error('Erro ao listar transações financeiras:', error);
      throw error;
    }
  }

  /**
   * Busca transação financeira pelo ID
   */
  static async getFinancialTransaction(id: number, companyId: number) {
    try {
      return await prisma.financialTransaction.findFirst({
        where: { 
          id,
          companyId
        },
        include: {
          account: true,
          category: true
        }
      });
    } catch (error) {
      logger.error(`Erro ao buscar transação financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma transação financeira
   */
  static async updateFinancialTransaction(
    id: number, 
    companyId: number, 
    data: {
      description?: string;
      amount?: number;
      date?: Date;
      type?: string;
      status?: string;
      accountId?: number;
      categoryId?: number | null;
      notes?: string;
    },
    oldTransaction?: any
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Primeiro, buscar a transação original para comparação
        const original = oldTransaction || await tx.financialTransaction.findFirst({
          where: { id, companyId }
        });
        
        if (!original) {
          throw new Error('Transação financeira não encontrada');
        }
        
        // Atualizar a transação
        const updated = await tx.financialTransaction.update({
          where: { id },
          data
        });
        
        // Verificar se precisamos atualizar saldos
        const statusChanged = data.status !== undefined && original.status !== data.status;
        const amountChanged = data.amount !== undefined && original.amount !== data.amount;
        const typeChanged = data.type !== undefined && original.type !== data.type;
        const accountChanged = data.accountId !== undefined && original.accountId !== data.accountId;
        
        if (statusChanged || amountChanged || typeChanged || accountChanged) {
          // Reverter transação original
          if (original.status === 'completed') {
            const originalMultiplier = original.type === 'income' ? -1 : 1;
            await tx.financialAccount.update({
              where: { id: original.accountId },
              data: {
                balance: {
                  increment: original.amount * originalMultiplier
                }
              }
            });
          }
          
          // Aplicar nova transação
          if ((data.status || original.status) === 'completed') {
            const newType = data.type || original.type;
            const newAmount = data.amount || original.amount;
            const newAccountId = data.accountId || original.accountId;
            const newMultiplier = newType === 'income' ? 1 : -1;
            
            await tx.financialAccount.update({
              where: { id: newAccountId },
              data: {
                balance: {
                  increment: newAmount * newMultiplier
                }
              }
            });
          }
        }
        
        return updated;
      });
    } catch (error) {
      logger.error(`Erro ao atualizar transação financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove uma transação financeira
   */
  static async deleteFinancialTransaction(id: number, companyId: number) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Primeiro, buscar a transação para atualizar o saldo
        const transaction = await tx.financialTransaction.findFirst({
          where: { id, companyId }
        });
        
        if (!transaction) {
          throw new Error('Transação financeira não encontrada');
        }
        
        // Se a transação estava completa, ajustar o saldo da conta
        if (transaction.status === 'completed') {
          const multiplier = transaction.type === 'income' ? -1 : 1;
          await tx.financialAccount.update({
            where: { id: transaction.accountId },
            data: {
              balance: {
                increment: transaction.amount * multiplier
              }
            }
          });
        }
        
        // Excluir a transação
        return await tx.financialTransaction.delete({
          where: { id }
        });
      });
    } catch (error) {
      logger.error(`Erro ao excluir transação financeira ${id}:`, error);
      throw error;
    }
  }
}