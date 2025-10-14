# Usamos a imagem Node para ter o ambiente de desenvolvimento Vite
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5174
# O comando '--host' é crucial para expor o servidor Vite para fora do container
CMD ["npm", "run", "dev", "--", "--host"]