# Estágio 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Copiar schema do Prisma PRIMEIRO
COPY prisma ./prisma/

# Instalar dependências (incluindo dev dependencies para build)
RUN npm install

# Gerar Prisma Client ANTES de copiar o código
RUN npx prisma generate

# Copiar código fonte DEPOIS de gerar o Prisma
COPY . .

# Build do TypeScript
RUN npm run build

# Estágio 2: Produção
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY prisma ./prisma/

# Copiar o arquivo .env (IMPORTANTE!)
COPY .env ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Gerar Prisma Client novamente no ambiente de produção
RUN npx prisma generate

# Copiar código compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]