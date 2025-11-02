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

    if (user.role !== "admin" && user.role !== "profesor") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = context.params;

    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");

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

    // Convertir ObjectIds a strings
    const grupoRespuesta = {
      ...grupo,
      _id: grupo._id.toString(),
      docentes: grupo.docentes.map(id => id.toString()),
      estudiantes: grupo.estudiantes.map(id => id.toString())
    };

    return new Response(
      JSON.stringify(grupoRespuesta),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener el grupo" }),
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

    if (user.role !== "admin" && user.role !== "profesor") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = context.params;
    const body = await context.request.json();

    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validaciones
    if (!body.nombre || !body.nombre.trim()) {
      return new Response(
        JSON.stringify({ error: "El nombre del grupo es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");

    const actualizaciones = {
      nombre: body.nombre.trim(),
      docentes: (body.docentes || []).map(docId => {
        if (typeof docId === "string") {
          return new ObjectId(docId);
        }
        return docId;
      }),
      estudiantes: (body.estudiantes || []).map(estId => {
        if (typeof estId === "string") {
          return new ObjectId(estId);
        }
        return estId;
      }),
      semestre: body.semestre || "",
      observaciones: body.observaciones || "",
      updatedAt: new Date()
    };

    let result;
    try {
      result = await gruposCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: actualizaciones },
        { returnDocument: "after" }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "ID de grupo inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!result.value) {
      return new Response(
        JSON.stringify({ error: "Grupo no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convertir ObjectIds a strings
    const grupoRespuesta = {
      ...result.value,
      _id: result.value._id.toString(),
      docentes: result.value.docentes.map(id => id.toString()),
      estudiantes: result.value.estudiantes.map(id => id.toString())
    };

    return new Response(
      JSON.stringify({
        success: true,
        message: "Grupo actualizado exitosamente",
        grupo: grupoRespuesta
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el grupo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(context) {
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

    const { id } = context.params;

    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");

    let result;
    try {
      result = await gruposCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "ID de grupo inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Grupo no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Grupo eliminado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar el grupo" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
