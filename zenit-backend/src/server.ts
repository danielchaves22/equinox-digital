// zenit-backend/src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json, urlencoded } from 'body-parser';
import { logger } from './utils/logger';
import routes from './routes';

// Carregar variáveis de ambiente
dotenv.config();

// Criar aplicação Express
const app = express();

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use('/api', routes);

// Iniciar o servidor
const PORT = process.env.ZENIT_PORT || 3010;
app.listen(PORT, () => {
  logger.info(`Zenit Backend rodando na porta ${PORT}`);
});

export default app;