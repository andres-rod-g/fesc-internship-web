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

# Construir la aplicación
RUN npm run build

# Exponer puerto
EXPOSE 4321

# Comando para ejecutar la aplicación
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4321"]