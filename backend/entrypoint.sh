#!/bin/sh

echo "Esperando o banco de dados ficar disponível..."

# Espera até o banco estar aceitando conexões
while ! nc -z db 5432; do
  sleep 1
done

echo "Banco disponível. Rodando migrações e seed..."

npx prisma migrate dev
npx prisma db seed

echo "Iniciando aplicação..."

npm run start:prod
