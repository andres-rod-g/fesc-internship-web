# 🐳 FESC Internship Platform - Docker Setup

## Requisitos Previos

- Docker Desktop instalado
- Docker Compose v2.0+

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd fesc-internship-platform
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

3. **Ejecutar con Docker Compose**
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f app
```

4. **Acceder a la aplicación**
- **Aplicación principal**: http://localhost:4321
- **MongoDB Express** (admin): http://localhost:8081
  - Usuario: `admin`
  - Contraseña: `admin123`

## 📦 Servicios Incluidos

### 🌐 App (Puerto 4321)
- Aplicación Astro + React
- Plataforma de registro de practicantes
- Generación de CVs en HTML/PDF

### 🍃 MongoDB (Puerto 27017)
- Base de datos principal
- Datos persistentes en volumen `mongodb_data`
- Script de inicialización incluido

### 🔧 MongoDB Express (Puerto 8081)
- Interfaz web para administrar MongoDB
- Solo se ejecuta con el perfil `admin`

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar con MongoDB Express (admin)
docker-compose --profile admin up -d

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart app

# Ver logs
docker-compose logs -f [servicio]
```

### Desarrollo
```bash
# Reconstruir la imagen de la app
docker-compose build app

# Ejecutar comandos en el contenedor
docker-compose exec app npm install
docker-compose exec app npm run build

# Acceder al shell del contenedor
docker-compose exec app sh
```

### Base de Datos
```bash
# Acceder a MongoDB CLI
docker-compose exec mongodb mongosh fesc-internship

# Backup de la base de datos
docker-compose exec mongodb mongodump --db fesc-internship --out /backup

# Restaurar backup
docker-compose exec mongodb mongorestore --db fesc-internship /backup/fesc-internship
```

## 🔐 Configuración de Producción

### Variables de Entorno
Crea un archivo `.env` con:
```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/fesc-internship
JWT_SECRET=your-super-secure-jwt-secret-here
```

### Seguridad
- Cambiar contraseñas por defecto
- Usar secretos seguros para JWT
- Configurar firewall apropiado
- Usar HTTPS en producción

## 📁 Estructura de Volúmenes

- `mongodb_data`: Datos persistentes de MongoDB
- `./public/uploads`: Archivos subidos (fotos, firmas, etc.)

## 🐛 Solución de Problemas

### Puerto ya en uso
```bash
# Verificar puertos ocupados
lsof -i :4321
lsof -i :27017

# Cambiar puertos en docker-compose.yml si es necesario
```

### Problemas de permisos
```bash
# Dar permisos a carpeta de uploads
sudo chmod -R 755 public/uploads
```

### Limpiar datos de MongoDB
```bash
# Detener servicios
docker-compose down

# Eliminar volumen de datos
docker volume rm fesc-internship-platoform_mongodb_data

# Reiniciar
docker-compose up -d
```

## 📊 Monitoreo

### Logs
```bash
# Ver logs de todos los servicios
docker-compose logs

# Seguir logs en tiempo real
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs app
```

### Estado de los servicios
```bash
# Ver servicios corriendo
docker-compose ps

# Estadísticas de uso
docker stats
```

## 🔄 Actualización

```bash
# Detener servicios
docker-compose down

# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose build
docker-compose up -d
```

## ✨ Usuario Administrador por Defecto

**Usuario**: `admin`  
**Contraseña**: `admin123`

⚠️ **IMPORTANTE**: Cambiar esta contraseña en producción

---

¿Problemas? Abre un issue en el repositorio.