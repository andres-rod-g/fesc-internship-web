import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();

    if (!body.grupoId || !body.titulo) {
      return new Response(
        JSON.stringify({ error: "grupoId y titulo son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const seguimientosCollection = db.collection("seguimientos-practicas");
    const gruposCollection = db.collection("grupos");
    const recursosCollection = db.collection("recursos");

    // Obtener el grupo para acceder a los estudiantes
    const grupo = await gruposCollection.findOne({
      _id: new ObjectId(body.grupoId)
    });

    if (!grupo) {
      return new Response(
        JSON.stringify({ error: "Grupo no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Crear un recurso para cada estudiante del grupo
    const entradas = [];
    const estudiantesIds = grupo.estudiantes || [];

    for (const estudianteId of estudiantesIds) {
      const nuevoRecurso = {
        usuarioId: new ObjectId(estudianteId),
        grupoId: new ObjectId(body.grupoId),
        tipo: "seguimiento",
        titulo: body.titulo,
        url: "",
        nota: null,
        notasAdicionales: "",
        verificado: false,
        verificacionRequerida: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const resultRecurso = await recursosCollection.insertOne(nuevoRecurso);

      // Crear entrada con referencia al recurso
      entradas.push({
        id: resultRecurso.insertedId.toString(),
        estudianteId: estudianteId.toString(),
        recursoId: resultRecurso.insertedId.toString(),
        observaciones: ""
      });
    }

    // Crear el seguimiento con las entradas
    const nuevoSeguimiento = {
      grupoId: new ObjectId(body.grupoId),
      titulo: body.titulo,
      descripcion: body.descripcion || "",
      entradas: entradas,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await seguimientosCollection.insertOne(nuevoSeguimiento);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Seguimiento creado exitosamente",
        seguimiento: {
          ...nuevoSeguimiento,
          _id: result.insertedId.toString(),
          grupoId: nuevoSeguimiento.grupoId.toString(),
          entradas: entradas
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al crear seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al crear el seguimiento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
