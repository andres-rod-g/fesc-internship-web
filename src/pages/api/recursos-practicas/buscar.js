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

    // Find resources
    const recursosNoVerificados = await db.collection('recursos')
      .find(query)
      .sort(sortObj)
      .toArray();

    // Populate with student and user details
    const recursosConDetalles = await Promise.all(
      recursosNoVerificados.map(async (recurso) => {
        let usuario = null;
        let estudiante = null;

        // Get user/student details
        if (recurso.usuarioId) {
          usuario = await db.collection('users')
            .findOne({ _id: recurso.usuarioId });

          if (!usuario) {
            estudiante = await db.collection('estudiantes')
              .findOne({ _id: recurso.usuarioId });
          }
        }

        return {
          ...recurso,
          usuario: usuario || estudiante
        };
      })
    );

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
