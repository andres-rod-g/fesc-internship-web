// Script de inicialización para MongoDB
db = db.getSiblingDB('fesc-internship');

// Crear colecciones principales
db.createCollection('practicantes');
db.createCollection('users');
db.createCollection('empresas');

// Crear índices para mejorar rendimiento
db.practicantes.createIndex({ "numero_documento": 1 }, { unique: true });
db.practicantes.createIndex({ "correo_institucional": 1 }, { unique: true });
db.practicantes.createIndex({ "estado": 1 });
db.practicantes.createIndex({ "programa": 1 });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.empresas.createIndex({ "nit": 1 }, { unique: true });

// Crear usuario administrador por defecto (opcional)
// Contraseña: admin123 (hash bcrypt)
db.users.insertOne({
  username: "admin",
  email: "admin@fesc.edu.co",
  password: "$2b$10$rOr6vF8Sl7Zk5M5DqF5zTe5Kp4E8N2wXf3Ry4P5WxT7V8aK9qN2rJ",
  role: "admin",
  createdAt: new Date()
});

print("Base de datos inicializada correctamente");
print("Usuario admin creado: username='admin', password='admin123'");
print("¡IMPORTANTE: Cambiar la contraseña del administrador en producción!");