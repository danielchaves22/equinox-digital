# Usar uma imagem não-Alpine que tem melhor suporte para módulos nativos
FROM node:20-slim AS builder
WORKDIR /app

# Instalar PNPM globalmente
RUN npm install -g pnpm

# Copiar package.json e instalar dependências
COPY package.json ./
RUN pnpm install

# Copiar arquivos do Prisma e gerar cliente
COPY prisma ./prisma
RUN pnpm prisma generate

# Copiar o restante do código e compilar
COPY . .
RUN pnpm build

# Usar a mesma imagem base para o runtime para manter compatibilidade binária
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiar arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Aplicar migrações e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]