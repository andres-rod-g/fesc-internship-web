import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST({ params, request }) {
  try {
    const { id } = params;
    const { practicante_id } = await request.json();
    
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    // Buscar la empresa
    const empresa = await empresasCollection.findOne({ _id: new ObjectId(id) });
    if (!empresa) {
      return new Response(
        JSON.stringify({ error: "Empresa no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Buscar la asignación actual
    const asignacionActual = empresa.practicantes_asignados?.find(
      p => p.practicante_id === practicante_id
    );
    
    if (!asignacionActual) {
      return new Response(
        JSON.stringify({ error: "El practicante no está asignado a esta empresa" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const estadoActual = asignacionActual.estado_practica;
    
    // Remover la asignación
    const updateResult = await empresasCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { practicantes_asignados: { practicante_id } },
        $inc: { 
          total_practicantes: -1,
          [estadoActual === 'activo' ? 'activos' : 
           estadoActual === 'completado' ? 'completados' : 'pendientes']: -1
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo desasignar el practicante" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Practicante desasignado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al desasignar practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}