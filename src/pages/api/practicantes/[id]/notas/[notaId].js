import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function DELETE({ params }) {
  try {
    const { id, notaId } = params;
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    
    // Eliminar la nota específica
    const result = await practicantesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { notas: { _id: new ObjectId(notaId) } },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Nota eliminada exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al eliminar nota:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}