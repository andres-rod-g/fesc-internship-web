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

    // Solo director puede crear/editar recursos
    if (user.role !== "admin" && user.role !== "director") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();

    // Validaciones
    if (!body.procesoPracticasId) {
      return new Response(
        JSON.stringify({ error: "ID del proceso de prácticas requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!body.tipo) {
      return new Response(
        JSON.stringify({ error: "Tipo de recurso requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    const nuevoRecurso = {
      procesoPracticasId: new ObjectId(body.procesoPracticasId),
      tipo: body.tipo, // 'evaluacion', 'seguimiento', 'autoevaluacion', 'arl', 'certificado', 'atlas', 'anexo'
      subtipo: body.subtipo || null,
      titulo: body.titulo || "",
      url: body.url || "",
      nota: body.nota || null,
      notasAdicionales: body.notasAdicionales || "",
      usuarioId: body.usuarioId || null,
      seguimientoId: body.seguimientoId || null,
      verificacionRequerida: body.verificacionRequerida !== undefined ? body.verificacionRequerida : false,
      estado: body.estado || "pendiente",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await recursosCollection.insertOne(nuevoRecurso);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Recurso creado exitosamente",
        recurso: {
          ...nuevoRecurso,
          _id: result.insertedId.toString(),
          procesoPracticasId: nuevoRecurso.procesoPracticasId.toString()
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear recurso:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el recurso" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
