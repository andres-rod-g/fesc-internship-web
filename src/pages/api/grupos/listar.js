import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";

export async function GET(context) {
  try {
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

    if (user.role !== "admin" && user.role !== "profesor") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");

    const grupos = await gruposCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Convertir ObjectIds a strings
    const gruposRespuesta = grupos.map(grupo => ({
      ...grupo,
      _id: grupo._id.toString(),
      docentes: grupo.docentes.map(id => id.toString()),
      estudiantes: grupo.estudiantes.map(id => id.toString())
    }));

    return new Response(
      JSON.stringify({
        success: true,
        grupos: gruposRespuesta
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al listar grupos:", error);
    return new Response(
      JSON.stringify({ error: "Error al listar grupos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
