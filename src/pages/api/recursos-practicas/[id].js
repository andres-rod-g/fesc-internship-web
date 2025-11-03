import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";
import { ObjectId } from "mongodb";

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
    const seguimientosCollection = db.collection("seguimientos-practicas");

    // Obtener recurso actual para verificar permisos y si URL cambió
    const recursoActual = await recursosCollection.findOne({ _id: new ObjectId(id) });

    if (!recursoActual) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar permisos: solo admin, director, profesor o el dueño del recurso pueden actualizarlo
    const isAdmin = user.role === "admin" || user.role === "director" || user.role === "profesor";
    const isOwner = recursoActual.usuarioId && recursoActual.usuarioId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para actualizar este recurso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Construir objeto de actualización solo con campos permitidos
    const updateObj = {
      url: body.url || "",
      nota: body.nota || null,
      notasAdicionales: body.notasAdicionales || "",
      updatedAt: new Date()
    };

    // Si la URL cambió, resetear estado a "pendiente"
    if (body.url && body.url !== recursoActual.url) {
      updateObj.estado = "pendiente";
    }

    const result = await recursosCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateObj }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Recurso no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // También actualizar las entradas en los seguimientos que contengan este recurso
    await seguimientosCollection.updateMany(
      { "entradas.recursoId": id },
      {
        $set: {
          "entradas.$[elem].recursoUrl": body.url || "",
          "entradas.$[elem].recursNota": body.nota || null,
          "entradas.$[elem].recursoObservaciones": body.notasAdicionales || "",
          updatedAt: new Date()
        }
      },
      { arrayFilters: [{ "elem.recursoId": id }] }
    );

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

    const recurso = await recursosCollection.findOne({ _id: new ObjectId(id) });

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
          procesoPracticasId: recurso.procesoPracticasId?.toString()
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
