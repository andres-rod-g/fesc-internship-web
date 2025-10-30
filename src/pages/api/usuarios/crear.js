import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "~/env.ts";

export async function POST({ request, cookies }) {
  try {
    const token = cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Solo admin puede crear usuarios
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden crear usuarios" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { username, email, password, role, nombres, apellidos } = await request.json();

    // Validaciones
    if (!username || !password || !role) {
      return new Response(
        JSON.stringify({ error: "Usuario, contraseña y rol son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const rolesValidos = ["admin", "profesor", "registro_control", "estudiante"];
    if (!rolesValidos.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Rol inválido. Roles válidos: ${rolesValidos.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar que no existe usuario con ese username
    const existingUser = await usersCollection.findOne({
      $or: [
        { username: username },
        ...(email ? [{ email: email }] : [])
      ]
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Ya existe un usuario con ese nombre de usuario o email" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email: email || null,
      password: hashedPassword,
      role,
      nombres: nombres || "",
      apellidos: apellidos || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.username
    };

    const result = await usersCollection.insertOne(newUser);

    return new Response(
      JSON.stringify({
        message: "Usuario creado exitosamente",
        user: {
          id: result.insertedId,
          username,
          email: email || null,
          role,
          nombres: nombres || "",
          apellidos: apellidos || ""
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
