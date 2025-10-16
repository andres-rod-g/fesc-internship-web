import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env.ts";
import bcrypt from "bcrypt";

function generateSecurePassword() {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function DELETE({ request, params, cookies }) {
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

    // Solo admin puede eliminar usuarios
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden eliminar usuarios" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = params;

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar que existe el usuario
    const usuarioAEliminar = await usersCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!usuarioAEliminar) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // No permitir eliminar al usuario actual
    if (usuarioAEliminar.username === user.username) {
      return new Response(
        JSON.stringify({ error: "No puedes eliminar tu propia cuenta" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Eliminar usuario
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo eliminar el usuario" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Usuario eliminado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT({ request, params, cookies }) {
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

    // Solo admin puede editar usuarios
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden editar usuarios" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = params;
    const { nombres, apellidos, email } = await request.json();

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar que existe el usuario
    const usuarioAActualizar = await usersCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!usuarioAActualizar) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si se quiere cambiar email, verificar que no exista otro con ese email
    if (email && email !== usuarioAActualizar.email) {
      const existingEmail = await usersCollection.findOne({
        email: email,
        _id: { $ne: new ObjectId(id) }
      });

      if (existingEmail) {
        return new Response(
          JSON.stringify({ error: "Ya existe un usuario con ese email" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Actualizar usuario
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombres: nombres || usuarioAActualizar.nombres || "",
          apellidos: apellidos || usuarioAActualizar.apellidos || "",
          email: email || usuarioAActualizar.email || null,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar el usuario" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Usuario actualizado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH({ request, params, cookies }) {
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

    // Solo admin puede reasignar contraseñas
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden reasignar contraseñas" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = params;

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Verificar que existe el usuario
    const usuarioAActualizar = await usersCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!usuarioAActualizar) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generar nueva contraseña
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar la contraseña" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        message: "Contraseña reasignada exitosamente",
        newPassword: newPassword
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al reasignar contraseña:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
