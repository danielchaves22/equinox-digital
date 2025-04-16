import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/user.controller';

const router = Router();

// Endpoint para listar usuários
router.get('/', getUsers);

// Endpoint para buscar um usuário pelo ID
router.get('/:id', getUserById);

export default router;
