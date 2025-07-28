import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function PUT({ params, request }) {
  try {
    const { id } = params;
    const { practicante_id, estado_practica } = await request.json();
    
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
    
    const estadoAnterior = asignacionActual.estado_practica;
    
    // Actualizar el estado en la asignación
    const updateResult = await empresasCollection.updateOne(
      { 
        _id: new ObjectId(id),
        "practicantes_asignados.practicante_id": practicante_id
      },
      {
        $set: {
          "practicantes_asignados.$.estado_practica": estado_practica,
          "practicantes_asignados.$.fecha_cambio_estado": new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar el estado" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Actualizar contadores
    const decrementField = estadoAnterior === 'activo' ? 'activos' : 
                          estadoAnterior === 'completado' ? 'completados' : 'pendientes';
    const incrementField = estado_practica === 'activo' ? 'activos' : 
                          estado_practica === 'completado' ? 'completados' : 'pendientes';
    
    const updateCounters = {};
    if (decrementField !== incrementField) {
      updateCounters[`$inc`] = {
        [decrementField]: -1,
        [incrementField]: 1
      };
    }
    
    if (Object.keys(updateCounters).length > 0) {
      await empresasCollection.updateOne(
        { _id: new ObjectId(id) },
        updateCounters
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Estado actualizado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al cambiar estado:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}