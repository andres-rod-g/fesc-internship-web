import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    // Buscar empresa que tenga este practicante asignado
    const empresa = await empresasCollection.findOne({
      "practicantes_asignados.practicante_id": id
    });
    
    if (!empresa) {
      return new Response(
        JSON.stringify({ empresa_asignada: null }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Buscar la asignación específica
    const asignacion = empresa.practicantes_asignados.find(
      p => p.practicante_id === id
    );
    
    return new Response(
      JSON.stringify({
        empresa_asignada: {
          _id: empresa._id,
          nombre: empresa.nombre,
          sector: empresa.sector
        },
        estado_practica: asignacion.estado_practica,
        fecha_asignacion: asignacion.fecha_asignacion,
        notas: asignacion.notas || ""
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al obtener empresa del practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}