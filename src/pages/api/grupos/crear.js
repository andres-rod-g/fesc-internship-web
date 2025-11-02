import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";
import { ObjectId } from "mongodb";

export async function POST(context) {
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

    const body = await context.request.json();

    // Validaciones
    if (!body.nombre || !body.nombre.trim()) {
      return new Response(
        JSON.stringify({ error: "El nombre del grupo es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");

    const nuevoGrupo = {
      nombre: body.nombre.trim(),
      docentes: (body.docentes || []).map(id => new ObjectId(id)),
      estudiantes: (body.estudiantes || []).map(id => new ObjectId(id)),
      semestre: body.semestre || "",
      observaciones: body.observaciones || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      creado_por: user.id
    };

    const result = await gruposCollection.insertOne(nuevoGrupo);

    // Convertir ObjectIds a strings para la respuesta
    const grupoRespuesta = {
      ...nuevoGrupo,
      _id: result.insertedId.toString(),
      docentes: nuevoGrupo.docentes.map(id => id.toString()),
      estudiantes: nuevoGrupo.estudiantes.map(id => id.toString())
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Grupo creado exitosamente",
        grupo: grupoRespuesta
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el grupo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
