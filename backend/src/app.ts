import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import companyRoutes from './routes/company.routes';

const app = express();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// 1) Rotas públicas
app.use('/api/auth', authRoutes);

// 2) Rotas protegidas (cada router aplica auth + tenant + authorize)
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

export default app;
