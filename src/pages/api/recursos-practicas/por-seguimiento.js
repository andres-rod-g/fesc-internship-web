import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();
    const { recursoIds } = body;

    if (!recursoIds || !Array.isArray(recursoIds) || recursoIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "recursoIds es requerido y debe ser un array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    // Validar que todos los IDs sean válidos ObjectIds
    const idsValidos = recursoIds.filter((id) => ObjectId.isValid(id));

    if (idsValidos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay IDs válidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener todos los recursos en una sola consulta
    const recursos = await recursosCollection
      .find({
        _id: { $in: idsValidos.map((id) => new ObjectId(id)) }
      })
      .toArray();

    // Convertir los resultados
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
        recursos: recursosConvertidos
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener recursos por seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener recursos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
