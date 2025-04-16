# Use a imagem base Node.js LTS
FROM node:18.18-alpine

# Define o diretório de trabalho no container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código para o container
COPY . .

# Se necessário, compile o código TypeScript (caso use um script "build")
# RUN npm run build

# Exponha a porta 3000
EXPOSE 3000

# Comando para iniciar a aplicação em modo desenvolvimento
CMD ["npm", "run", "dev"]
