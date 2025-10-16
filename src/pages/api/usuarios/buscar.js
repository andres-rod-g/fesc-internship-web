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

    // Solo admin puede buscar usuarios
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Solo administradores pueden buscar usuarios" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("q") || "";
    const rolFiltro = url.searchParams.get("rol") || "";

    const db = await connectDB();
    const usersCollection = db.collection("users");

    // Build query
    const query = {};

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");
      query.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { nombres: searchRegex },
        { apellidos: searchRegex }
      ];
    }

    if (rolFiltro && rolFiltro !== "todos") {
      query.role = rolFiltro;
    }

    // Execute query
    const usuarios = await usersCollection
      .find(query)
      .project({ password: 0 }) // Exclude password
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return new Response(
      JSON.stringify({ usuarios }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
