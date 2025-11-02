import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function POST(context) {
  try {
    const body = await context.request.json();
    const { busqueda } = body;

    if (!busqueda || busqueda.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Término de búsqueda requerido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const gruposCollection = db.collection("grupos");
    const usuariosCollection = db.collection("users");

    const terminoBusqueda = busqueda.trim();
    const regex = new RegExp(terminoBusqueda, "i"); // búsqueda case-insensitive

    // Buscar grupos por nombre
    const gruposPorNombre = await gruposCollection
      .find({
        nombre: regex
      })
      .toArray();

    // Obtener IDs de todos los grupos para búsqueda por docente
    const todosLosGrupos = await gruposCollection.find({}).toArray();

    // Buscar docentes que coincidan con el término
    const docentesQueCoinciden = await usuariosCollection
      .find({
        $or: [
          { nombres: regex },
          { apellidos: regex }
        ]
      })
      .toArray();

    // Encontrar grupos que tengan estos docentes
    const gruposPorDocente = todosLosGrupos.filter((grupo) => {
      if (!grupo.docentes || grupo.docentes.length === 0) {
        return false;
      }

      // Verificar si alguno de los docentes del grupo coincide
      return grupo.docentes.some((docenteId) => {
        return docentesQueCoinciden.some((docente) => docente._id.toString() === docenteId.toString());
      });
    });

    // Combinar resultados sin duplicados
    const gruposSet = new Set();
    const gruposResultado = [];

    gruposPorNombre.forEach((grupo) => {
      gruposSet.add(grupo._id.toString());
      gruposResultado.push({
        ...grupo,
        _id: grupo._id.toString()
      });
    });

    gruposPorDocente.forEach((grupo) => {
      const grupoId = grupo._id.toString();
      if (!gruposSet.has(grupoId)) {
        gruposSet.add(grupoId);
        gruposResultado.push({
          ...grupo,
          _id: grupoId
        });
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        grupos: gruposResultado
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al buscar grupos:", error);
    return new Response(
      JSON.stringify({ error: "Error al buscar grupos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
