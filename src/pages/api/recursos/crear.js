import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();

    if (!body.procesoPracticasId || !body.usuarioId || !body.grupoId || !body.tipo) {
      return new Response(
        JSON.stringify({ error: "Campos requeridos: procesoPracticasId, usuarioId, grupoId, tipo" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    // Estructura base del recurso
    const nuevoRecurso = {
      procesoPracticasId: new ObjectId(body.procesoPracticasId),
      usuarioId: new ObjectId(body.usuarioId),
      grupoId: new ObjectId(body.grupoId),
      tipo: body.tipo, // evaluacion, seguimiento, autoevaluacion, arl, atlas, anexos, certificado
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Campos específicos por tipo
    if (body.tipo === "evaluacion") {
      nuevoRecurso.nota1 = body.nota1 || null;
      nuevoRecurso.nota2 = body.nota2 || null;
      nuevoRecurso.nota3 = body.nota3 || null;
      nuevoRecurso.nota4 = body.nota4 || null;
      nuevoRecurso.enlace = body.enlace || "";
      nuevoRecurso.notasAdicionales = body.notasAdicionales || "";
      nuevoRecurso.verificacionRequerida = body.verificacionRequerida !== undefined ? body.verificacionRequerida : false;
    } else if (body.tipo === "autoevaluacion") {
      nuevoRecurso.contenido = body.contenido || ""; // Texto de auto-evaluación
      nuevoRecurso.verificacionRequerida = body.verificacionRequerida !== undefined ? body.verificacionRequerida : false;
    } else if (body.tipo === "atlas") {
      nuevoRecurso.subtipo = body.subtipo; // autorizacionDocente, autorizacionEstudiante, relacionTrabos
      nuevoRecurso.titulo = body.titulo || "";
      nuevoRecurso.url = body.url || "";
      nuevoRecurso.verificado = body.verificado || false;
      nuevoRecurso.verificacionRequerida = body.verificacionRequerida !== undefined ? body.verificacionRequerida : true;
    } else {
      // Para: seguimiento, arl, anexos, certificado
      nuevoRecurso.titulo = body.titulo || "";
      nuevoRecurso.url = body.url || "";
      nuevoRecurso.nota = body.nota || null;
      nuevoRecurso.notasAdicionales = body.notasAdicionales || "";
      nuevoRecurso.verificado = body.verificado || false;
      nuevoRecurso.verificacionRequerida = body.verificacionRequerida !== undefined ? body.verificacionRequerida : true;
    }

    const result = await recursosCollection.insertOne(nuevoRecurso);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Recurso creado exitosamente",
        recurso: {
          ...nuevoRecurso,
          _id: result.insertedId.toString(),
          procesoPracticasId: nuevoRecurso.procesoPracticasId.toString(),
          usuarioId: nuevoRecurso.usuarioId.toString(),
          grupoId: nuevoRecurso.grupoId.toString()
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear recurso:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el recurso" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
