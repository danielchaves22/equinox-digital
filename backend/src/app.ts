import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import { tenantMiddleware } from './middlewares/tenant.middleware';
import { setupSwagger } from './swagger';

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// 1) Documentação interativa disponível em http://localhost:3000/api-docs
setupSwagger(app);

// 2) Rotas públicas de autenticação
app.use('/api/auth', authRoutes);

// 3) Rotas protegidas (autenticação e tenant)
//    Note que dentro de cada router você já aplica authMiddleware e tenantMiddleware
app.use('/api/users', tenantMiddleware, userRoutes);
app.use('/api/companies', tenantMiddleware, companyRoutes);

export default app;
