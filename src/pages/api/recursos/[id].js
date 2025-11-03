import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";

export async function GET(context) {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");
    const recurso = await recursosCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!recurso) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        recurso: {
          ...recurso,
          _id: recurso._id.toString(),
          procesoPracticasId: recurso.procesoPracticasId?.toString() || null,
          usuarioId: recurso.usuarioId?.toString() || null,
          grupoId: recurso.grupoId?.toString() || null
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener recurso:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener el recurso" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(context) {
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

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    // Obtener recurso actual para validar permisos
    const recursoActual = await recursosCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!recursoActual) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar permisos
    const isAdmin = user.role === "admin" || user.role === "director" || user.role === "profesor";
    const isOwner = recursoActual.usuarioId && recursoActual.usuarioId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para actualizar este recurso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { _id, ...bodyWithoutId } = body;

    const updateData = {
      ...bodyWithoutId,
      updatedAt: new Date()
    };

    // Convertir ObjectIds si existen
    if (body.procesoPracticasId && typeof body.procesoPracticasId === "string") {
      updateData.procesoPracticasId = new ObjectId(body.procesoPracticasId);
    }
    if (body.usuarioId && typeof body.usuarioId === "string") {
      updateData.usuarioId = new ObjectId(body.usuarioId);
    }
    if (body.grupoId && typeof body.grupoId === "string") {
      updateData.grupoId = new ObjectId(body.grupoId);
    }

    const result = await recursosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Recurso actualizado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar recurso:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el recurso" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(context) {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    const result = await recursosCollection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Recurso eliminado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al eliminar recurso:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar el recurso" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
