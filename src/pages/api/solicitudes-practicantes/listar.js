import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";

export async function GET(context) {
  try {
    // Verificar autenticación
    const token = context.cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
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

    // Solo Director puede ver solicitudes
    if (user.role !== "director" && user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para acceder" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const collection = db.collection("solicitudes_practicantes");

    const page = parseInt(context.url.searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {};
    const estado = context.url.searchParams.get("estado");
    if (estado) {
      query.estado = estado;
    }

    const total = await collection.countDocuments(query);
    const solicitudes = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return new Response(
      JSON.stringify({
        solicitudes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al listar solicitudes:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener solicitudes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
