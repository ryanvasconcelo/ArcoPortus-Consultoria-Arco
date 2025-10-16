# Dockerfile Final e Definitivo

# ==========================================================
# Estágio 1: 'builder' - Responsável por criar os artefatos
# ==========================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala TODAS as dependências (dev e prod)
RUN npm install

# Copia todo o resto do código fonte
COPY . .

# Compila o TypeScript para JavaScript, criando a pasta /dist
# Isso acontece UMA VEZ, durante o 'docker build'
RUN npm run build

# ==========================================================
# Estágio 2: 'production' - A imagem final e otimizada
# ==========================================================
FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependência e o schema
COPY package*.json ./
COPY prisma ./prisma/

# Instala APENAS as dependências de produção
RUN npm ci --only=production

# Copia os artefatos que criamos no estágio anterior
COPY --from=builder /app/dist ./dist                 # Nosso código compilado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma # O cliente Prisma gerado

# Copia e prepara nosso script de inicialização
COPY docker-entrypoint.sh .
RUN chmod +x /app/docker-entrypoint.sh

# Expõe a porta
EXPOSE 3335

# Define o script que SEMPRE roda primeiro
ENTRYPOINT [ "/app/docker-entrypoint.sh" ]

# O comando final: executar o código já compilado
CMD ["node", "dist/server.js"]