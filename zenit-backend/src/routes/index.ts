// zenit-backend/src/routes/index.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import financialAccountRoutes from './financial-account.routes';
import financialCategoryRoutes from './financial-category.routes';
import financialTransactionRoutes from './financial-transaction.routes';

const router = Router();

// Rota pública para verificar saúde da API
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Middleware para autenticação em todas as rotas protegidas
router.use(authMiddleware);
router.use(tenantMiddleware);

// Rota de teste protegida
router.get('/me', (req, res) => {
  res.status(200).json({
    message: 'Autenticado com sucesso!',
    user: req.user
  });
});

// APIs financeiras
router.use('/financial-accounts', financialAccountRoutes);
router.use('/financial-categories', financialCategoryRoutes);
router.use('/financial-transactions', financialTransactionRoutes);

export default router;