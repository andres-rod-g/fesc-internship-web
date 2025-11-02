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

    const terminoBusqueda = busqueda.trim();
    const regex = new RegExp(terminoBusqueda, "i"); // búsqueda case-insensitive

    // Buscar grupos por nombre, semestre o docentes usando aggregation
    const gruposResultado = await gruposCollection
      .aggregate([
        {
          $match: {
            $or: [
              { nombre: regex },
              { semestre: { $regex: terminoBusqueda, $options: "i" } }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            let: { docentes: "$docentes" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$docentes"]
                  }
                }
              },
              {
                $match: {
                  $or: [
                    { nombres: regex },
                    { apellidos: regex }
                  ]
                }
              }
            ],
            as: "docentesCoincidentes"
          }
        },
        {
          $addFields: {
            tieneDocenteCoincidencia: {
              $gt: [{ $size: "$docentesCoincidentes" }, 0]
            }
          }
        },
        {
          $match: {
            $or: [
              { nombre: regex },
              { semestre: { $regex: terminoBusqueda, $options: "i" } },
              { tieneDocenteCoincidencia: true }
            ]
          }
        },
        {
          $project: {
            _id: { $toString: "$_id" },
            nombre: 1,
            docentes: {
              $map: {
                input: "$docentes",
                as: "docId",
                in: { $toString: "$$docId" }
              }
            },
            estudiantes: {
              $map: {
                input: "$estudiantes",
                as: "estId",
                in: { $toString: "$$estId" }
              }
            },
            semestre: 1,
            observaciones: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ])
      .toArray();

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
