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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 10;
    const skip = (page - 1) * limit;

    // Sorting parameters
    const sortBy = url.searchParams.get("sortBy") || "createdAt"; // Field to sort by
    const sortOrder = url.searchParams.get("sortOrder") || "desc"; // 'asc' or 'desc'

    // Validate sortBy to prevent injection
    const validSortFields = ["nombres", "apellidos", "correo_institucional", "numero_documento", "estado_laboral", "createdAt", "programa"];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

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

    // Combinar todas las condiciones con $and
    if (andConditions.length > 0) {
      if (andConditions.length === 1) {
        Object.assign(query, andConditions[0]);
      } else {
        query.$and = andConditions;
      }
    }

    // Obtener total de documentos
    const total = await practicantesCollection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Ejecutar query con paginación y sorting
    const sortObject = { [safeSortBy]: safeSortOrder };
    const practicantes = await practicantesCollection
      .find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Crear URLs para las fotos
    const practicantesConFoto = practicantes.map(p => {
      if (p.foto && p.foto.data) {
        return {
          ...p,
          foto_url: `/api/practicantes/${p._id}/foto`
        };
      }
      return p;
    });

    return new Response(
      JSON.stringify({
        practicantes: practicantesConFoto,
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
