// zenit-backend/src/routes/financial-category.routes.ts
import { Router } from 'express';
import { FinancialCategoryController } from '../controllers/financial-category.controller';

const router = Router();

router.post('/', FinancialCategoryController.createFinancialCategory);
router.get('/', FinancialCategoryController.listFinancialCategories);
router.get('/:id', FinancialCategoryController.getFinancialCategory);
router.put('/:id', FinancialCategoryController.updateFinancialCategory);
router.delete('/:id', FinancialCategoryController.deleteFinancialCategory);

export default router;