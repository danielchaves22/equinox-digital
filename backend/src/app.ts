import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';
import { tenantMiddleware } from './middlewares/tenant.middleware';

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// rotas públicas
app.use('/api/auth', authRoutes);

// aplica o middleware de tenant (tipado corretamente)
app.use(tenantMiddleware);

// rotas protegidas
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

export default app;
