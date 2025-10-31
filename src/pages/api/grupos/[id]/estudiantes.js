import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";
import { ObjectId } from "mongodb";

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

    const { id } = context.params;

    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({ error: "ID de grupo inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");
    const usersCollection = db.collection("users");

    let grupo;
    try {
      grupo = await gruposCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "ID de grupo inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!grupo) {
      return new Response(
        JSON.stringify({ error: "Grupo no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener datos de estudiantes
    const estudiantesIds = grupo.estudiantes.map(id => new ObjectId(id));
    const usuariosData = await usersCollection
      .find({ _id: { $in: estudiantesIds } })
      .toArray();

    // Convertir ObjectIds a strings
    const estudiantesConvertidos = usuariosData.map(est => ({
      ...est,
      _id: est._id.toString()
    }));

    return new Response(
      JSON.stringify({ estudiantes: estudiantesConvertidos }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener estudiantes del grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los estudiantes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
