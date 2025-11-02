import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();
    const { grupoId } = body;

    if (!grupoId || !ObjectId.isValid(grupoId)) {
      return new Response(
        JSON.stringify({ error: "grupoId inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");
    const seguimientosCollection = db.collection("seguimientos-practicas");

    // Obtener todos los seguimientos del grupo
    const seguimientos = await seguimientosCollection
      .find({ grupoId: new ObjectId(grupoId) })
      .toArray();

    // Extraer todos los recursoIds de las entradas
    const recursoIds = [];
    const recursoIdToEntrada = {}; // Mapa para relacionar resourceId con sus entradas

    seguimientos.forEach((seg) => {
      if (seg.entradas && Array.isArray(seg.entradas)) {
        seg.entradas.forEach((entrada) => {
          if (entrada.recursoId) {
            recursoIds.push(entrada.recursoId);
            if (!recursoIdToEntrada[entrada.recursoId]) {
              recursoIdToEntrada[entrada.recursoId] = [];
            }
            recursoIdToEntrada[entrada.recursoId].push({
              estudianteId: entrada.estudianteId,
              seguimientoId: seg._id.toString()
            });
          }
        });
      }
    });

    // Si no hay recursos, retornar array vacío
    if (recursoIds.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          recursos: [],
          recursoIdToEntrada: {}
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener todos los recursos en una sola consulta
    const recursos = await recursosCollection
      .find({
        _id: { $in: recursoIds.map((id) => {
          // Manejar IDs que pueden ser string u ObjectId
          if (ObjectId.isValid(id)) {
            return new ObjectId(id);
          }
          return id;
        }) }
      })
      .toArray();

    // Convertir ObjectIds a strings
    const recursosConvertidos = recursos.map((r) => ({
      ...r,
      _id: r._id.toString(),
      procesoPracticasId: r.procesoPracticasId?.toString() || null,
      usuarioId: r.usuarioId?.toString() || null,
      grupoId: r.grupoId?.toString() || null
    }));

    return new Response(
      JSON.stringify({
        success: true,
        recursos: recursosConvertidos,
        recursoIdToEntrada: recursoIdToEntrada
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener recursos por grupo y seguimientos:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener recursos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
