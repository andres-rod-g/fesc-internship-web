import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST({ params, request }) {
  try {
    const { id } = params;
    const { 
      practicante_id, 
      estado_practica, 
      salario_mensual, 
      funciones_practicante, 
      supervisor_nombre,
      supervisor_cargo,
      supervisor_telefono,
      supervisor_email
    } = await request.json();
    
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
    
    // Verificar que el practicante no esté ya asignado
    const yaAsignado = empresa.practicantes_asignados?.some(
      p => p.practicante_id === practicante_id
    );
    
    if (yaAsignado) {
      return new Response(
        JSON.stringify({ error: "El practicante ya está asignado a esta empresa" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Crear nueva asignación
    const nuevaAsignacion = {
      practicante_id,
      estado_practica: estado_practica || 'pendiente',
      fecha_asignacion: new Date(),
      salario_mensual: salario_mensual || 0,
      funciones_practicante: funciones_practicante || "",
      supervisor: {
        nombre: supervisor_nombre || "",
        cargo: supervisor_cargo || "",
        telefono: supervisor_telefono || "",
        email: supervisor_email || ""
      },
      notas: ""
    };
    
    // Actualizar empresa
    const updateResult = await empresasCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { practicantes_asignados: nuevaAsignacion },
        $inc: { 
          total_practicantes: 1,
          [estado_practica === 'activo' ? 'activos' : 
           estado_practica === 'completado' ? 'completados' : 'pendientes']: 1
        },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (updateResult.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "No se pudo actualizar la empresa" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Practicante asignado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al asignar practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}