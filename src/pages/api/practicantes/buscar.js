import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env.ts";

export async function GET({ request, cookies }) {
  try {
    const token = cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autenticado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Solo admin puede ver la lista completa
    if (user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permisos" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("q") || "";
    const pagFilter = url.searchParams.get("pago") || ""; // 'validado', 'no_validado', ''
    const userFilter = url.searchParams.get("usuario") || ""; // 'creado', 'pendiente', ''
    const estadoFilter = url.searchParams.get("estado") || ""; // 'preinscrito', 'pago_pendiente', 'pago_validado', 'estudiante_creado'
    const estadoPracticaFilter = url.searchParams.get("estado_practica") || ""; // 'pendiente', 'activo', 'completado'
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortBy = url.searchParams.get("sortBy") || "createdAt"; // Field to sort by
    const sortOrder = url.searchParams.get("sortOrder") || "desc"; // 'asc' or 'desc'

    // Validate sortBy to prevent injection
    const validSortFields = ["nombres", "apellidos", "correo_institucional", "numero_documento", "estado_laboral", "estado_preinscripcion", "createdAt", "programa"];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    const empresasCollection = db.collection("empresas");

    // Construir query
    const query = {};
    const andConditions = [];

    // Búsqueda por texto
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");
      andConditions.push({
        $or: [
          { nombres: searchRegex },
          { apellidos: searchRegex },
          { correo_institucional: searchRegex },
          { numero_documento: searchRegex }
        ]
      });
    }

    // Filtro por pago
    if (pagFilter === "validado") {
      andConditions.push({
        estado_preinscripcion: {
          $in: ["pago_validado", "estudiante_creado"]
        }
      });
    } else if (pagFilter === "no_validado") {
      andConditions.push({
        estado_preinscripcion: {
          $nin: ["pago_validado", "estudiante_creado"]
        }
      });
    }

    // Filtro por usuario
    if (userFilter === "creado") {
      andConditions.push({
        estado_preinscripcion: "estudiante_creado"
      });
    } else if (userFilter === "pendiente") {
      andConditions.push({
        estado_preinscripcion: "pago_validado"
      });
    }

    // Filtro por estado de preinscripción
    if (estadoFilter) {
      andConditions.push({
        estado_preinscripcion: estadoFilter
      });
    }

    // Filtro por estado de práctica en empresa
    if (estadoPracticaFilter) {
      andConditions.push({
        estado_practica_en_empresa: estadoPracticaFilter
      });
    }

    // Combinar todas las condiciones con $and
    let matchStage = {};
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        matchStage = andConditions[0];
      } else {
        matchStage.$and = andConditions;
      }
    }

    // Construir pipeline de agregación
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "empresas",
          let: { practicante_id: { $toString: "$_id" } },
          pipeline: [
            {
              $unwind: "$practicantes_asignados"
            },
            {
              $match: {
                $expr: {
                  $eq: ["$practicantes_asignados.practicante_id", "$$practicante_id"]
                }
              }
            },
            {
              $project: {
                _id: 0,
                empresa_id: "$_id",
                empresa_nombre: "$nombre",
                empresa_sector: "$sector",
                estado_practica_en_empresa: "$practicantes_asignados.estado_practica",
                fecha_asignacion: "$practicantes_asignados.fecha_asignacion"
              }
            }
          ],
          as: "empresa_info"
        }
      },
      {
        $unwind: {
          path: "$empresa_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          estado_practica_en_empresa: {
            $cond: {
              if: { $eq: ["$empresa_info", null] },
              then: null,
              else: "$empresa_info.estado_practica_en_empresa"
            }
          }
        }
      }
    ];

    // Obtener total de documentos con agregación
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await practicantesCollection.aggregate(totalPipeline).toArray();
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // Ejecutar query con paginación y sorting
    const sortObject = { [safeSortBy]: safeSortOrder };
    const finalPipeline = [
      ...pipeline,
      { $sort: sortObject },
      { $skip: skip },
      { $limit: limit },
      {
        $addFields: {
          foto_url: {
            $concat: ["/api/practicantes/", { $toString: "$_id" }, "/foto"]
          }
        }
      }
    ];

    const practicantes = await practicantesCollection.aggregate(finalPipeline).toArray();

    return new Response(
      JSON.stringify({
        practicantes: practicantes,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al buscar practicantes:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
