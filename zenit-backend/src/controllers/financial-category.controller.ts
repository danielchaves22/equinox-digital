// zenit-backend/src/controllers/financial-category.controller.ts
import { Request, Response } from 'express';
import { FinancialCategoryService } from '../services/financial-category.service';
import { logger } from '../utils/logger';

export class FinancialCategoryController {
  /**
   * Cria uma nova categoria financeira
   * POST /api/financial-categories
   */
  static async createFinancialCategory(req: Request, res: Response) {
    try {
      const { name, type, color } = req.body;
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      // Validação básica
      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }
      
      // Validar tipo
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }
      
      const category = await FinancialCategoryService.createFinancialCategory({
        name,
        type,
        color: color || '#3B82F6', // Cor padrão se não for fornecida
        companyId
      });
      
      return res.status(201).json(category);
    } catch (error) {
      logger.error('Erro ao criar categoria financeira:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria financeira' });
    }
  }
  
  /**
   * Lista todas as categorias financeiras
   * GET /api/financial-categories
   */
  static async listFinancialCategories(req: Request, res: Response) {
    try {
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      const type = req.query.type as string | undefined;
      
      // Validar tipo se fornecido
      if (type && !['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }
      
      const categories = await FinancialCategoryService.listFinancialCategories(companyId, type);
      return res.status(200).json(categories);
    } catch (error) {
      logger.error('Erro ao listar categorias financeiras:', error);
      return res.status(500).json({ error: 'Erro ao listar categorias financeiras' });
    }
  }
  
  /**
   * Busca uma categoria financeira pelo ID
   * GET /api/financial-categories/:id
   */
  static async getFinancialCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      const category = await FinancialCategoryService.getFinancialCategory(id, companyId);
      
      if (!category) {
        return res.status(404).json({ error: 'Categoria financeira não encontrada' });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      logger.error(`Erro ao buscar categoria financeira:`, error);
      return res.status(500).json({ error: 'Erro ao buscar categoria financeira' });
    }
  }
  
  /**
   * Atualiza uma categoria financeira
   * PUT /api/financial-categories/:id
   */
  static async updateFinancialCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      const { name, type, color } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      // Garantir que ao menos um campo foi fornecido
      if (!name && type === undefined && color === undefined) {
        return res.status(400).json({ error: 'Nenhum dado fornecido para atualização' });
      }
      
      // Validar tipo se fornecido
      if (type && !['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Tipo deve ser income ou expense' });
      }
      
      await FinancialCategoryService.updateFinancialCategory(id, companyId, {
        name,
        type,
        color
      });
      
      return res.status(200).json({ message: 'Categoria financeira atualizada com sucesso' });
    } catch (error) {
      logger.error(`Erro ao atualizar categoria financeira:`, error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria financeira' });
    }
  }
  
  /**
   * Remove uma categoria financeira
   * DELETE /api/financial-categories/:id
   */
  static async deleteFinancialCategory(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const companyId = req.currentCompanyId!; // Usa o validado pelo middleware
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      
      await FinancialCategoryService.deleteFinancialCategory(id, companyId);
      return res.status(204).send();
    } catch (error: any) {
      logger.error(`Erro ao excluir categoria financeira:`, error);
      
      if (error.message?.includes('transações vinculadas')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Erro ao excluir categoria financeira' });
    }
  }
}