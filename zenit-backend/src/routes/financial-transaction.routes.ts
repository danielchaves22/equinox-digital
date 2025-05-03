// zenit-backend/src/routes/financial-transaction.routes.ts
import { Router } from 'express';
import { FinancialTransactionController } from '../controllers/financial-transaction.controller';

const router = Router();

router.post('/', FinancialTransactionController.createFinancialTransaction);
router.get('/', FinancialTransactionController.listFinancialTransactions);
router.get('/:id', FinancialTransactionController.getFinancialTransaction);
router.put('/:id', FinancialTransactionController.updateFinancialTransaction);
router.delete('/:id', FinancialTransactionController.deleteFinancialTransaction);

export default router;