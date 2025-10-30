import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const { procesoPracticasId } = context.url.searchParams;

    if (!procesoPracticasId) {
      return new Response(
        JSON.stringify({ error: "procesoPracticasId es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!ObjectId.isValid(procesoPracticasId)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const recursosCollection = db.collection("recursos");

    const recursos = await recursosCollection
      .find({ procesoPracticasId: new ObjectId(procesoPracticasId) })
      .toArray();

    return new Response(
      JSON.stringify({
        success: true,
        recursos: recursos.map((r) => ({
          ...r,
          _id: r._id.toString(),
          procesoPracticasId: r.procesoPracticasId.toString(),
          usuarioId: r.usuarioId.toString(),
          grupoId: r.grupoId.toString()
        }))
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener recursos:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener los recursos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
