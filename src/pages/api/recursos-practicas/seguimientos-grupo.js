import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const grupoId = context.url.searchParams.get("grupoId");

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
      .sort({ createdAt: -1 })
      .toArray();

    // Para cada seguimiento, obtener todos sus recursos
    const seguimientosConRecursos = await Promise.all(
      seguimientos.map(async (seg) => {
        // Obtener todos los recursos de este seguimiento (uno por estudiante)
        const recursos = await recursosCollection
          .find({
            tipo: "seguimiento",
            titulo: seg.titulo,
            grupoId: new ObjectId(grupoId)
          })
          .toArray();

        return {
          _id: seg._id.toString(),
          titulo: seg.titulo,
          descripcion: seg.descripcion,
          grupoId: seg.grupoId.toString(),
          recursos: recursos.map((r) => ({
            _id: r._id.toString(),
            usuarioId: r.usuarioId?.toString(),
            url: r.url || "",
            nota: r.nota || null,
            notasAdicionales: r.notasAdicionales || "",
            verificado: r.verificado || false
          }))
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        seguimientos: seguimientosConRecursos
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener recursos de seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener recursos de seguimiento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
