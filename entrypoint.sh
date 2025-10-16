#!/bin/sh
set -e

echo "🔧 Generando archivo .env desde variables de entorno..."

ENV_KEYS="MONGODB_URI DB_NAME ADMIN_USER ADMIN_PASS ADMIN_ROLE JWT_SECRET NODE_ENV APP_PORT"

rm -f .env
touch .env

for key in $ENV_KEYS; do
  eval val=\$$key
  if [ -n "$val" ]; then
    printf '%s="%s"\n' "$key" "$val" >> .env
  fi
done

echo "✅ .env generado con:"
cat .env

echo "🚀 Iniciando aplicación Astro SSR..."
node ./dist/server/entry.mjs
