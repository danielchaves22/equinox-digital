import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';

import { authMiddleware } from './middlewares/auth.middleware';
import { tenantMiddleware } from './middlewares/tenant.middleware';

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// 1) Rotas públicas de auth
app.use('/api/auth', authRoutes);

// 2) Valida o token em todas as demais rotas
app.use(authMiddleware);

// 3) Valida multi-tenant (empresa definida)
app.use(tenantMiddleware);

// 4) Rotas protegidas
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

export default app;
