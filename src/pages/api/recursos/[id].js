import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

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
          procesoPracticasId: recurso.procesoPracticasId.toString(),
          usuarioId: recurso.usuarioId.toString(),
          grupoId: recurso.grupoId.toString()
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
