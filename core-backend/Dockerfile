# Usar uma imagem completa do Debian para ter todas as bibliotecas necessárias
FROM node:20 AS builder
WORKDIR /app

# Instalar bibliotecas essenciais
RUN apt-get update && apt-get install -y \
    openssl \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Instalar PNPM globalmente
RUN npm install -g pnpm

# Copiar package.json e fazer uma instalação completa
COPY package.json ./
RUN pnpm install

# Copiar código e gerar o client Prisma
COPY prisma ./prisma
RUN pnpm prisma generate

# Copiar todo o código-fonte e compilar
COPY . .
RUN pnpm build

# Segunda etapa - imagem idêntica para preservar compatibilidade
FROM node:20 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Instalar apenas o essencial para a execução
RUN apt-get update && apt-get install -y \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Reinstalar o bcrypt no ambiente de execução para garantir compatibilidade
COPY package.json ./
RUN npm install bcrypt --no-save

# Copiar arquivos gerados e dependências
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Aplicar migrações e iniciar o servidor
CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]