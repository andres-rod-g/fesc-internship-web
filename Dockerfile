# Dockerfile para FESC Internship Platform
FROM node:18-alpine

# Instalar dependencias del sistema necesarias para bcrypt y otras librerías nativas
RUN apk add --no-cache python3 make g++ libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias con legacy peer deps (debido a conflictos de Astro)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Mostrar contenido del .env para debugging
RUN echo "=== Contenido del archivo .env ===" && \
    if [ -f .env ]; then \
        echo "Archivo .env encontrado:" && \
        cat .env; \
    else \
        echo "Archivo .env no encontrado"; \
    fi && \
    echo "=== Fin del contenido .env ==="

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 4321

# Comando para ejecutar la aplicación
CMD echo "=== Variables de entorno en tiempo de ejecución ===" && \
    echo "MONGODB_URI=${MONGODB_URI}" && \
    echo "NODE_ENV=${NODE_ENV}" && \
    echo "JWT_SECRET=${JWT_SECRET}" && \
    echo "ADMIN_USER=${ADMIN_USER}" && \
    echo "APP_PORT=${APP_PORT}" && \
    echo "=== Fin de variables de entorno ===" && \
    npm run preview -- --host 0.0.0.0 --port 4321