import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
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

    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden crear estudiantes" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { practicante_id, password } = await request.json();

    if (!practicante_id) {
      return new Response(
        JSON.stringify({ error: "ID de practicante es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (password && password.length < 6) {
      return new Response(
        JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    const usersCollection = db.collection("users");

    const practicante = await practicantesCollection.findOne({
      _id: new ObjectId(practicante_id)
    });

    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (practicante.estado_preinscripcion !== "pago_validado") {
      return new Response(
        JSON.stringify({ error: "El practicante no tiene el pago validado" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que el email del practicante existe
    if (!practicante.correo_institucional) {
      return new Response(
        JSON.stringify({ error: "El practicante no tiene correo institucional asignado" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar que no exista ya un usuario con este email
    const existingUser = await usersCollection.findOne({
      email: practicante.correo_institucional
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Ya existe un usuario con este correo" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const newUser = {
      username: practicante.numero_documento,
      email: practicante.correo_institucional,
      role: "estudiante",
      practicante_id: new ObjectId(practicante_id),
      nombres: practicante.nombres,
      apellidos: practicante.apellidos,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Si se proporciona contraseña, hashearla y agregarla
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser.password = hashedPassword;
    }

    const userResult = await usersCollection.insertOne(newUser);

    await practicantesCollection.updateOne(
      { _id: new ObjectId(practicante_id) },
      {
        $set: {
          estado_preinscripcion: "estudiante_creado",
          "estudiante_info.usuario_id": userResult.insertedId,
          "estudiante_info.fecha_creacion": new Date(),
          "estudiante_info.creado_por": user.username,
          updatedAt: new Date()
        }
      }
    );

    return new Response(
      JSON.stringify({
        message: "Estudiante creado exitosamente",
        usuario: {
          username: practicante.numero_documento,
          email: practicante.correo_institucional,
          nombres: practicante.nombres,
          apellidos: practicante.apellidos
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear estudiante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
