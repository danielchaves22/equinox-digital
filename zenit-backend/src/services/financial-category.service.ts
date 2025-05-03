// zenit-backend/src/services/financial-category.service.ts
import { prisma } from '../lib/prisma-client';
import { logger } from '../utils/logger';

export class FinancialCategoryService {
  /**
   * Cria uma nova categoria financeira
   */
  static async createFinancialCategory(data: {
    name: string;
    type: string;
    color?: string;
    companyId: number;
  }) {
    try {
      return await prisma.financialCategory.create({
        data
      });
    } catch (error) {
      logger.error('Erro ao criar categoria financeira:', error);
      throw error;
    }
  }

  /**
   * Lista todas as categorias financeiras de uma empresa
   */
  static async listFinancialCategories(companyId: number, type?: string) {
    try {
      const where = { companyId };
      
      // Filtrar por tipo se especificado
      if (type) {
        Object.assign(where, { type });
      }
      
      return await prisma.financialCategory.findMany({
        where,
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      logger.error('Erro ao listar categorias financeiras:', error);
      throw error;
    }
  }

  /**
   * Busca categoria financeira pelo ID
   */
  static async getFinancialCategory(id: number, companyId: number) {
    try {
      return await prisma.financialCategory.findFirst({
        where: { 
          id,
          companyId
        }
      });
    } catch (error) {
      logger.error(`Erro ao buscar categoria financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Atualiza uma categoria financeira
   */
  static async updateFinancialCategory(id: number, companyId: number, data: {
    name?: string;
    type?: string;
    color?: string;
  }) {
    try {
      return await prisma.financialCategory.updateMany({
        where: { 
          id,
          companyId
        },
        data
      });
    } catch (error) {
      logger.error(`Erro ao atualizar categoria financeira ${id}:`, error);
      throw error;
    }
  }

  /**
   * Remove uma categoria financeira
   */
  static async deleteFinancialCategory(id: number, companyId: number) {
    try {
      // Verificar se há transações usando esta categoria
      const transactionCount = await prisma.financialTransaction.count({
        where: { categoryId: id }
      });
      
      if (transactionCount > 0) {
        throw new Error('Não é possível excluir categoria financeira com transações vinculadas');
      }
      
      return await prisma.financialCategory.deleteMany({
        where: { 
          id,
          companyId
        }
      });
    } catch (error) {
      logger.error(`Erro ao excluir categoria financeira ${id}:`, error);
      throw error;
    }
  }
}