#!/bin/sh

# docker-entrypoint.sh

echo "Backend: Iniciando o container..."

echo "Backend: Aplicando migrações do banco de dados..."
# O comando 'deploy' é o mais seguro para ambientes automatizados
npx prisma migrate deploy

echo "Backend: Migrações concluídas."
echo "Backend: Iniciando a aplicação..."

# Este comando executa o que foi definido no CMD do Dockerfile
exec "$@"