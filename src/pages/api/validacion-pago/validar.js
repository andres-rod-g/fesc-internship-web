import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env.ts";

export async function POST({ request, cookies }) {
  try {
    const token = cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autenticado" }),
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

    if (!["admin", "registro_control"].includes(user.role)) {
      return new Response(
        JSON.stringify({ error: "No tienes permisos para validar pagos" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { practicante_id, accion, comentarios } = await request.json();

    if (!practicante_id || !accion) {
      return new Response(
        JSON.stringify({ error: "ID de practicante y acción son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!["aprobar", "rechazar"].includes(accion)) {
      return new Response(
        JSON.stringify({ error: "Acción debe ser 'aprobar' o 'rechazar'" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    const practicante = await practicantesCollection.findOne({
      _id: new ObjectId(practicante_id)
    });

    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (practicante.estado_preinscripcion !== "pago_pendiente") {
      return new Response(
        JSON.stringify({ error: "El practicante no está en estado válido para validar pago" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const nuevoEstado = accion === "aprobar" ? "pago_validado" : "rechazado";
    const estadoValidacion = accion === "aprobar" ? "aprobado" : "rechazado";

    await practicantesCollection.updateOne(
      { _id: new ObjectId(practicante_id) },
      {
        $set: {
          estado_preinscripcion: nuevoEstado,
          "validacion_pago.estado": estadoValidacion,
          "validacion_pago.validado_por": user.username,
          "validacion_pago.fecha_validacion": new Date(),
          "validacion_pago.comentarios": comentarios || null,
          updatedAt: new Date()
        }
      }
    );

    return new Response(
      JSON.stringify({
        message: `Pago ${accion === "aprobar" ? "aprobado" : "rechazado"} exitosamente`,
        estado: nuevoEstado
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al validar pago:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
