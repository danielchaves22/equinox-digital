// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Declaração global para prevenção de múltiplas instâncias durante hot-reload
declare global {
  var prismaClient: PrismaClient | undefined;
}

// Função para criar o cliente com logs adequados
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
        ]
      : ['error'],
  });
  
  // Configuração de logs em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e: any) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });
    
    client.$on('error', (e: any) => {
      logger.error('Prisma Error:', e);
    });
  }
  
  return client;
}

// Em desenvolvimento, usa a variável global para evitar múltiplas 
// instâncias durante hot-reload. Em produção, cria uma nova instância.
export const prisma = global.prismaClient || createPrismaClient();

// Apenas em desenvolvimento, salva na variável global
if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

// Função para desconectar o cliente (útil para testes)
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}