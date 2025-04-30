// __tests__/setup.ts
import { prisma, disconnectPrisma } from '../src/lib/prisma';

// Exporta o singleton do Prisma para uso nos testes
export { prisma };

// Setup global para todos os testes
beforeAll(async () => {
  // Garante que estamos no ambiente de teste
  if (process.env.NODE_ENV !== 'test') {
    console.warn('ATENÇÃO: Testes não estão rodando com NODE_ENV=test');
    process.env.NODE_ENV = 'test';
  }
});

// Limpeza após todos os testes
afterAll(async () => {
  // Desconecta o Prisma para evitar handles pendentes
  await disconnectPrisma();
});