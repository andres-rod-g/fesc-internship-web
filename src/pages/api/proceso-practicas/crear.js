import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();

    if (!body.estudianteId || !body.grupoId) {
      return new Response(
        JSON.stringify({ error: "ID del estudiante e ID del grupo son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const procesoPracticasCollection = db.collection("proceso-practicas");
    const recursosCollection = db.collection("recursos");

    // Verificar que no exista ya un proceso para este estudiante + grupo
    const procesoExistente = await procesoPracticasCollection.findOne({
      estudianteId: new ObjectId(body.estudianteId),
      grupoId: new ObjectId(body.grupoId)
    });

    if (procesoExistente) {
      return new Response(
        JSON.stringify({ error: "Este estudiante ya tiene un proceso de prácticas en este grupo" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Buscar el practicante por email del estudiante
    let practicanteId = null;
    if (body.practicanteId) {
      practicanteId = new ObjectId(body.practicanteId);
    } else {
      // Obtener email del estudiante
      const estudiante = await db.collection("users").findOne({
        _id: new ObjectId(body.estudianteId)
      });

      if (estudiante && estudiante.email) {
        // Buscar practicante con mismo email
        const practicante = await db.collection("practicantes").findOne({
          correo_institucional: estudiante.email
        });

        if (practicante) {
          practicanteId = practicante._id;
        }
      }
    }

    const estudianteIdObj = new ObjectId(body.estudianteId);
    const grupoIdObj = new ObjectId(body.grupoId);

    // Crear recursos de ARL
    const arlResource = await recursosCollection.insertOne({
      procesoPracticasId: null, // Se asignará después
      usuarioId: estudianteIdObj,
      grupoId: grupoIdObj,
      tipo: "arl",
      titulo: "",
      url: "",
      nota: null,
      notasAdicionales: "",
      verificado: false,
      verificacionRequerida: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Crear recursos de ATLAS
    const atlasAutorizacionDocenteResource = await recursosCollection.insertOne({
      procesoPracticasId: null,
      usuarioId: estudianteIdObj,
      grupoId: grupoIdObj,
      tipo: "atlas",
      subtipo: "autorizacionDocente",
      titulo: "",
      url: "",
      verificado: false,
      verificacionRequerida: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const atlasAutorizacionEstudianteResource = await recursosCollection.insertOne({
      procesoPracticasId: null,
      usuarioId: estudianteIdObj,
      grupoId: grupoIdObj,
      tipo: "atlas",
      subtipo: "autorizacionEstudiante",
      titulo: "",
      url: "",
      verificado: false,
      verificacionRequerida: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const atlasRelacionTrabosResource = await recursosCollection.insertOne({
      procesoPracticasId: null,
      usuarioId: estudianteIdObj,
      grupoId: grupoIdObj,
      tipo: "atlas",
      subtipo: "relacionTrabos",
      titulo: "",
      url: "",
      verificado: false,
      verificacionRequerida: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Crear proceso de prácticas
    const nuevoProces = {
      estudianteId: estudianteIdObj,
      grupoId: grupoIdObj,
      practicanteId: practicanteId,
      esConsultoria: false,

      // Referencias a recursos
      evaluacionId: null,
      seguimiento: [],
      autoevaluacion: [],
      arlId: arlResource.insertedId.toString(),
      certificadoId: null,
      atlasAutorizacionDocenteId: atlasAutorizacionDocenteResource.insertedId.toString(),
      atlasAutorizacionEstudianteId: atlasAutorizacionEstudianteResource.insertedId.toString(),
      atlasRelacionTrabosId: atlasRelacionTrabosResource.insertedId.toString(),
      anexoIds: [],
      agenda: [],

      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await procesoPracticasCollection.insertOne(nuevoProces);
    const procesoId = result.insertedId;

    // Actualizar los recursos para que sepan a qué proceso pertenecen
    await recursosCollection.updateMany(
      {
        _id: { $in: [
          arlResource.insertedId,
          atlasAutorizacionDocenteResource.insertedId,
          atlasAutorizacionEstudianteResource.insertedId,
          atlasRelacionTrabosResource.insertedId
        ]}
      },
      { $set: { procesoPracticasId: procesoId } }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Proceso de prácticas creado exitosamente",
        procesoPracticas: {
          ...nuevoProces,
          _id: procesoId.toString(),
          estudianteId: nuevoProces.estudianteId.toString(),
          grupoId: nuevoProces.grupoId.toString(),
          practicanteId: nuevoProces.practicanteId?.toString() || null
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear proceso de prácticas:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el proceso de prácticas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
