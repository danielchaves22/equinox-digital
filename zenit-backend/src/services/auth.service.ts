// zenit-backend/src/services/auth.service.ts
import axios from 'axios';
import { logger } from '../utils/logger';

const CORE_API_URL = process.env.CORE_API_URL || 'http://localhost:3000/api';

export interface UserInfo {
  userId: number;
  role: string;
  companyIds: number[];
}

export class AuthService {
  /**
   * Verifica se um token JWT é válido consultando o core-backend
   */
  static async verifyToken(token: string): Promise<UserInfo | null> {
    try {
      console.log(CORE_API_URL)
      const response = await axios.get(`${CORE_API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error('Erro ao verificar token com core-backend:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem permissão para acessar um recurso específico
   */
  static hasAccess(userInfo: UserInfo, companyId: number): boolean {
    // Admin tem acesso a todas as empresas
    if (userInfo.role === 'ADMIN') return true;
    
    // Usuários só podem acessar empresas às quais estão vinculados
    return userInfo.companyIds.includes(companyId);
  }
}