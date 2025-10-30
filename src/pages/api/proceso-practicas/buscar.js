import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const estudianteId = searchParams.get("estudianteId");
    const grupoId = searchParams.get("grupoId");

    if (!estudianteId || !grupoId) {
      return new Response(
        JSON.stringify({ error: "estudianteId y grupoId son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!ObjectId.isValid(estudianteId) || !ObjectId.isValid(grupoId)) {
      return new Response(
        JSON.stringify({ error: "IDs inválidos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const procesoPracticas = await db.collection("proceso-practicas").findOne({
      estudianteId: new ObjectId(estudianteId),
      grupoId: new ObjectId(grupoId)
    });

    if (!procesoPracticas) {
      return new Response(
        JSON.stringify({ procesoPracticas: null }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        procesoPracticas: {
          ...procesoPracticas,
          _id: procesoPracticas._id.toString(),
          estudianteId: procesoPracticas.estudianteId.toString(),
          grupoId: procesoPracticas.grupoId?.toString() || null,
          practicanteId: procesoPracticas.practicanteId?.toString() || null
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al buscar proceso de prácticas:", error);
    return new Response(
      JSON.stringify({ error: "Error al buscar el proceso de prácticas" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
