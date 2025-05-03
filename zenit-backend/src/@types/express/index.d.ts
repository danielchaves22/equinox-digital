// zenit-backend/src/@types/express/index.d.ts
import { UserInfo } from '../../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

export {};