// zenit-backend/src/routes/financial-account.routes.ts
import { Router } from 'express';
import { FinancialAccountController } from '../controllers/financial-account.controller';

const router = Router();

router.post('/', FinancialAccountController.createFinancialAccount);
router.get('/', FinancialAccountController.listFinancialAccounts);
router.get('/:id', FinancialAccountController.getFinancialAccount);
router.put('/:id', FinancialAccountController.updateFinancialAccount);
router.delete('/:id', FinancialAccountController.deleteFinancialAccount);

export default router;