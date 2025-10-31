import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const grupoId = context.url.searchParams.get("grupoId");

    if (!grupoId) {
      return new Response(
        JSON.stringify({ error: "grupoId es requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!ObjectId.isValid(grupoId)) {
      return new Response(
        JSON.stringify({ error: "grupoId inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const seguimientosCollection = db.collection("seguimientos-practicas");

    const seguimientos = await seguimientosCollection
      .find({ grupoId: new ObjectId(grupoId) })
      .sort({ createdAt: -1 })
      .toArray();

    const seguimientosConvertidos = seguimientos.map((seg) => ({
      ...seg,
      _id: seg._id.toString(),
      grupoId: seg.grupoId.toString(),
      entradas: seg.entradas?.map((entrada) => ({
        ...entrada,
        estudianteId: typeof entrada.estudianteId === "string" ? entrada.estudianteId : entrada.estudianteId?.toString(),
        recursoId: typeof entrada.recursoId === "string" ? entrada.recursoId : entrada.recursoId?.toString()
      })) || []
    }));

    return new Response(
      JSON.stringify({
        success: true,
        seguimientos: seguimientosConvertidos
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al listar seguimientos:", error);
    return new Response(
      JSON.stringify({ error: "Error al listar seguimientos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
