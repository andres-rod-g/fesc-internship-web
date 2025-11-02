import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const grupoId = context.url.searchParams.get("grupoId");

    console.log("grupoId recibido:", grupoId);
    console.log("ObjectId.isValid:", ObjectId.isValid(grupoId));

    if (!grupoId) {
      return new Response(
        JSON.stringify({ error: "grupoId requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!ObjectId.isValid(grupoId)) {
      return new Response(
        JSON.stringify({ error: "grupoId inválido", grupoId }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const procesosCollection = db.collection("proceso-practicas");

    // Get all procesos for this group with evaluaciones
    const procesos = await procesosCollection
      .find({ grupoId: new ObjectId(grupoId) })
      .project({
        estudianteId: 1,
        evaluacion: 1
      })
      .toArray();

    console.log("Procesos encontrados:", procesos.length);
    console.log("Primer proceso:", JSON.stringify(procesos[0], null, 2));

    // Create a map of estudiante ID -> evaluaciones
    const evaluacionesPorEstudiante = {};

    procesos.forEach((proceso) => {
      console.log("Procesando:", proceso.estudianteId, proceso.evaluacion);
      if (proceso.estudianteId && proceso.evaluacion) {
        evaluacionesPorEstudiante[proceso.estudianteId.toString()] = {
          calificacion_1: proceso.evaluacion.nota1 || null,
          calificacion_2: proceso.evaluacion.nota2 || null,
          calificacion_3: proceso.evaluacion.nota3 || null,
          calificacion_4: proceso.evaluacion.nota4 || null
        };
      }
    });

    console.log("Evaluaciones por estudiante:", JSON.stringify(evaluacionesPorEstudiante, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        evaluacionesPorEstudiante
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener evaluaciones del grupo:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener evaluaciones" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
