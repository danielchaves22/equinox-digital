import { Router } from 'express';
import { createCompany, listCompanies } from '../controllers/company.controller';

const router = Router();

// Endpoint para criação de nova empresa
router.post('/', createCompany);

// Endpoint para listar empresas
router.get('/', listCompanies);

export default router;
