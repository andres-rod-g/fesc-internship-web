import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    
    // Buscar el practicante
    const practicante = await practicantesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({
        notas: practicante.notas || []
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST({ params, request }) {
  try {
    const { id } = params;
    const { contenido } = await request.json();
    
    if (!contenido || contenido.trim() === '') {
      return new Response(
        JSON.stringify({ error: "El contenido de la nota es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    
    // Crear nueva nota
    const nuevaNota = {
      _id: new ObjectId(),
      contenido: contenido.trim(),
      fecha: new Date(),
      usuario: "Administrador" // En el futuro se puede obtener del token
    };
    
    // Agregar la nota al practicante
    const result = await practicantesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { notas: nuevaNota },
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
      JSON.stringify({ message: "Nota agregada exitosamente" }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al agregar nota:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}