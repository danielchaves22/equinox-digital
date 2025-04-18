// src/routes/user.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { tenantMiddleware } from '../middlewares/tenant.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller';

const router = Router();

// 1) Validação de token
router.use(authMiddleware);
// 2) Validação de multi-tenant
router.use(tenantMiddleware);

// 3) Autorização baseada em policy + controller
router.post(
  '/',
  authorize('create', 'user'),
  createUser
);

router.get(
  '/',
  authorize('read', 'user'),
  getUsers
);

router.get(
  '/:id',
  authorize('read', 'user'),
  getUserById
);

router.put(
  '/:id',
  authorize('update', 'user'),
  updateUser
);

router.delete(
  '/:id',
  authorize('delete', 'user'),
  deleteUser
);

export default router;
