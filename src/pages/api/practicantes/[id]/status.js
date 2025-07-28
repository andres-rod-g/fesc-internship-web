import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function PUT({ request, params }) {
  try {
    const { id } = params;
    const { estado } = await request.json();
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    const validStates = ["pendiente", "revisando", "finalizado", "rechazado"];
    if (!validStates.includes(estado)) {
      return new Response(
        JSON.stringify({ error: "Estado inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await practicantesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Estado actualizado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar estado del practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
