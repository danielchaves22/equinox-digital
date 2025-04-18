// src/routes/company.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany
} from '../controllers/company.controller';

const router = Router();

// 1) Autenticação
router.use(authMiddleware);
// 2) Multi‑tenant
router.use(tenantMiddleware);

// 3) Autorização e controller
router.post('/',    authorize('create', 'company'), createCompany);
router.get('/',     authorize('read',   'company'), listCompanies);
router.put('/:id',  authorize('update', 'company'), updateCompany);
router.delete('/:id', authorize('delete','company'), deleteCompany);

export default router;
