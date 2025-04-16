import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';

const router = Router();

// Endpoint para registro de usuário
router.post('/register', register);

// Endpoint para login
router.post('/login', login);

export default router;
