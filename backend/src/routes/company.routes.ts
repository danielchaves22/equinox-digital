import { Router } from 'express';
import {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany
} from '../controllers/company.controller';

const router = Router();

router.post('/', createCompany);       // Criar
router.get('/', listCompanies);        // Listar
router.put('/:id', updateCompany);     // Atualizar
router.delete('/:id', deleteCompany);  // Excluir

export default router;
