// zenit-backend/src/services/financial-account.service.ts
import { prisma } from '../lib/prisma-client';
import { logger } from '../utils/logger';

export class FinancialAccountService {
  /**
   * Cria uma nova conta financeira
   */
  static async createFinancialAccount(data: {
    name: string;
    type: string;
    balance: number;
    accountNumber?: string;
    bankName?: string;
    companyId: number;
    userId: number;
  }) {
    try {
      return await prisma.financialAccount.create({
        data: {
          name: data.name,
          type: data.type,
          balance: data.balance,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          companyId: data.companyId,
          userId: data.userId
        }
      });
    } catch (error) {
      logger.error('Erro ao criar conta financeira:', error);
      throw error;
    }
  }

  /**
   * Lista todas as contas financeiras de uma empresa
   */
  static async listFinancialAccounts(companyId: number) {
    try {
      return await prisma.financialAccount.findMany({
        where: { companyId },
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      logger.error('Erro ao listar contas financeiras:', error);
      throw error;
    }
  }

  /**
   * Busca conta financeira pelo ID
   */
  static async getFinancialAccount(id: number, companyId: number) {
    try {
      return await prisma.financialAccount.findFirst({
        where: { 
          id,
          companyId
        }
      });
    } catch (error) {
      logger.error(`Erro ao buscar conta financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma conta financeira
   */
  static async updateFinancialAccount(id: number, companyId: number, data: {
    name?: string;
    type?: string;
    balance?: number;
    accountNumber?: string;
    bankName?: string;
    isActive?: boolean;
  }) {
    try {
      return await prisma.financialAccount.updateMany({
        where: { 
          id,
          companyId
        },
        data
      });
    } catch (error) {
      logger.error(`Erro ao atualizar conta financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove uma conta financeira
   */
  static async deleteFinancialAccount(id: number, companyId: number) {
    try {
      // Verificar se existem transações vinculadas à conta
      const transactionCount = await prisma.financialTransaction.count({
        where: { accountId: id }
      });
      
      if (transactionCount > 0) {
        throw new Error('Não é possível excluir conta financeira com transações vinculadas');
      }
      
      return await prisma.financialAccount.deleteMany({
        where: { 
          id,
          companyId
        }
      });
    } catch (error) {
      logger.error(`Erro ao excluir conta financeira ${id}:`, error);
      throw error;
    }
  }
}