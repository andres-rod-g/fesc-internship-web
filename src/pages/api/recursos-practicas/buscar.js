import { connectDB } from '~/utils/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '~/env';
import { ObjectId } from 'mongodb';

export async function GET({ request, cookies }) {
  try {
    // Verify authentication
    const token = cookies.get('token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'No authenticated' }), { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    // Check authorization
    if (!['admin', 'director_practicas'].includes(user.role)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('search') || '';
    const filterType = url.searchParams.get('type') || '';
    const sortBy = url.searchParams.get('sort') || 'createdAt_desc';

    const db = await connectDB();

    // Build query
    const query = {
      verificacionRequerida: true,
      verificado: { $ne: true },
      $and: [
        { url: { $exists: true } },
        { url: { $ne: null } },
        { url: { $ne: "" } },
        { url: { $regex: /\S/ } }  // Must contain at least one non-whitespace character
      ]
    };

    // Add type filter
    if (filterType) {
      query.tipo = filterType;
    }

    // Build search query
    let searchQuery = {};
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      searchQuery = {
        $or: [
          { url: searchRegex },
          { titulo: searchRegex },
          { notasAdicionales: searchRegex }
        ]
      };

      // Merge with existing query
      Object.assign(query, searchQuery);
    }

    // Parse sort parameter
    let sortObj = { createdAt: -1 };
    if (sortBy === 'createdAt_asc') {
      sortObj = { createdAt: 1 };
    } else if (sortBy === 'updatedAt_desc') {
      sortObj = { updatedAt: -1 };
    } else if (sortBy === 'updatedAt_asc') {
      sortObj = { updatedAt: 1 };
    }

    // Use aggregation pipeline to fetch all related data in a single query
    const recursosConDetalles = await db.collection('recursos')
      .aggregate([
        { $match: query },
        { $sort: sortObj },
        // Lookup users
        {
          $lookup: {
            from: 'users',
            localField: 'usuarioId',
            foreignField: '_id',
            as: 'usuarioData'
          }
        },
        // Lookup estudiantes (fallback if no user found)
        {
          $lookup: {
            from: 'estudiantes',
            localField: 'usuarioId',
            foreignField: '_id',
            as: 'estudianteData'
          }
        },
        // Lookup proceso-practicas
        {
          $lookup: {
            from: 'proceso-practicas',
            localField: 'procesoPracticasId',
            foreignField: '_id',
            as: 'procesoData'
          }
        },
        // Unwind arrays for easier processing
        {
          $addFields: {
            usuario: {
              $cond: [
                { $gt: [{ $size: '$usuarioData' }, 0] },
                { $arrayElemAt: ['$usuarioData', 0] },
                { $arrayElemAt: ['$estudianteData', 0] }
              ]
            },
            proceso: { $arrayElemAt: ['$procesoData', 0] }
          }
        },
        // Lookup grupos via proceso.grupoId
        {
          $lookup: {
            from: 'grupos',
            localField: 'proceso.grupoId',
            foreignField: '_id',
            as: 'grupoData'
          }
        },
        // Lookup practicantes by email
        {
          $lookup: {
            from: 'practicantes',
            let: { email: { $ifNull: ['$usuario.correo_institucional', '$usuario.email'] } },
            pipeline: [
              { $match: { $expr: { $eq: ['$correo_institucional', '$$email'] } } }
            ],
            as: 'practicanteData'
          }
        },
        // Final projection
        {
          $project: {
            _id: { $toString: '$_id' },
            procesoPracticasId: 1,
            usuarioId: 1,
            tipo: 1,
            subtipo: 1,
            url: 1,
            titulo: 1,
            nota: 1,
            notasAdicionales: 1,
            verificacionRequerida: 1,
            verificado: 1,
            createdAt: 1,
            updatedAt: 1,
            usuario: 1,
            grupo: { $arrayElemAt: ['$grupoData', 0] },
            practicanteId: { $toString: { $arrayElemAt: ['$practicanteData._id', 0] } }
          }
        }
      ])
      .toArray();

    // Additional search filtering on populated data
    let filteredResults = recursosConDetalles;
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      filteredResults = recursosConDetalles.filter((recurso) => {
        const nombre = `${recurso.usuario?.nombres || ''} ${recurso.usuario?.apellidos || ''}`.toLowerCase();
        const correo = (recurso.usuario?.correo_institucional || recurso.usuario?.email || '').toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        return (
          nombre.includes(searchLower) ||
          correo.includes(searchLower) ||
          recurso.url?.includes(searchTerm) ||
          recurso.titulo?.includes(searchTerm)
        );
      });
    }

    return new Response(JSON.stringify({ recursos: filteredResults }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error searching resources:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
