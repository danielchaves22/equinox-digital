import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/user.controller';

const router = Router();

router.post('/', createUser);         // Criar usuário
router.get('/', getUsers);            // Listar usuários
router.get('/:id', getUserById);      // Detalhar usuário
router.put('/:id', updateUser);       // Atualizar usuário
router.delete('/:id', deleteUser);    // Excluir usuário

export default router;
