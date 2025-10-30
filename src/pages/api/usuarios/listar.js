import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env.ts";

export async function GET({ request, cookies }) {
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

    // Solo admin puede listar usuarios
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permisos para listar usuarios" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Obtener parámetro de filtro rol si existe
    const url = new URL(request.url);
    const rolFilter = url.searchParams.get("rol");

    // Construir query
    const query = rolFilter ? { role: rolFilter } : {};

    // Obtener usuarios (sin mostrar contraseñas)
    const usuarios = await usersCollection
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(
      JSON.stringify({
        message: "Usuarios obtenidos exitosamente",
        usuarios
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
