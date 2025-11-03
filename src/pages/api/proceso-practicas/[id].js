import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";
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
    const procesoPracticasCollection = db.collection("proceso-practicas");

    const procesoPracticas = await procesoPracticasCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!procesoPracticas) {
      return new Response(
        JSON.stringify({ error: "Proceso de prácticas no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        procesoPracticas: {
          ...procesoPracticas,
          _id: procesoPracticas._id.toString(),
          estudianteId: procesoPracticas.estudianteId.toString(),
          grupoId: procesoPracticas.grupoId?.toString() || null,
          practicanteId: procesoPracticas.practicanteId?.toString() || null,
          arlId: procesoPracticas.arlId?.toString() || null,
          certificadoId: procesoPracticas.certificadoId?.toString() || null,
          atlasAutorizacionDocenteId: procesoPracticas.atlasAutorizacionDocenteId?.toString() || null,
          atlasAutorizacionEstudianteId: procesoPracticas.atlasAutorizacionEstudianteId?.toString() || null,
          atlasRelacionTrabosId: procesoPracticas.atlasRelacionTrabosId?.toString() || null,
          anexoIds: procesoPracticas.anexoIds?.map((id) => id.toString()) || []
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener proceso de prácticas:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener el proceso de prácticas" }),
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

    const db = await connectDB();
    const procesoPracticasCollection = db.collection("proceso-practicas");

    // Obtener proceso actual para validar permisos
    const procesoPracticasActual = await procesoPracticasCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!procesoPracticasActual) {
      return new Response(
        JSON.stringify({ error: "Proceso de prácticas no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar permisos
    const isAdmin = user.role === "admin" || user.role === "director" || user.role === "profesor";
    const isOwner = procesoPracticasActual.estudianteId && procesoPracticasActual.estudianteId.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return new Response(
        JSON.stringify({ error: "No tienes permiso para actualizar este proceso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();

    // Excluir _id del body para evitar error de inmutabilidad
    const { _id, ...bodyWithoutId } = body;

    // Si es estudiante (propietario), solo permite actualizar ciertos campos
    let updateData;
    if (!isAdmin && isOwner) {
      // Estudiante solo puede actualizar: seguimiento, autoevaluacion
      updateData = {
        seguimiento: bodyWithoutId.seguimiento,
        autoevaluacion: bodyWithoutId.autoevaluacion,
        updatedAt: new Date()
      };
    } else {
      // Admin/Director/Profesor puede actualizar todo
      updateData = {
        ...bodyWithoutId,
        updatedAt: new Date()
      };

      // Convertir ObjectIds si existen
      if (body.estudianteId && typeof body.estudianteId === "string") {
        updateData.estudianteId = new ObjectId(body.estudianteId);
      }
      if (body.grupoId && typeof body.grupoId === "string") {
        updateData.grupoId = new ObjectId(body.grupoId);
      }
      if (body.practicanteId && typeof body.practicanteId === "string") {
        updateData.practicanteId = new ObjectId(body.practicanteId);
      }

      // Convertir IDs de recursos si vienen como strings
      const resourceIdFields = [
        "evaluacionId",
        "arlId",
        "certificadoId",
        "atlasAutorizacionDocenteId",
        "atlasAutorizacionEstudianteId",
        "atlasRelacionTrabosId"
      ];

      resourceIdFields.forEach((field) => {
        if (body[field] && typeof body[field] === "string") {
          updateData[field] = new ObjectId(body[field]);
        }
      });

      // Convertir anexoIds (array de strings a ObjectIds)
      if (body.anexoIds && Array.isArray(body.anexoIds)) {
        updateData.anexoIds = body.anexoIds.map((id) =>
          typeof id === "string" ? new ObjectId(id) : id
        );
      }
    }

    const result = await procesoPracticasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Proceso de prácticas no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Proceso de prácticas actualizado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar proceso de prácticas:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el proceso de prácticas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
