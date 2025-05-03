FROM node:20-slim AS builder

WORKDIR /app

# Instalar PNPM globalmente
RUN npm install -g pnpm

# Copiar apenas o package.json
COPY package.json ./

# Instalar dependências
RUN pnpm install

# Copiar todo o código
COPY . .

# Build
RUN pnpm build

FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copiar arquivos necessários do estágio anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Expor porta
EXPOSE 3000

# Comando para executar o servidor
CMD ["pnpm", "start"]