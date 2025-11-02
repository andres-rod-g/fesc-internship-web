import { connectDB } from '~/utils/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '~/env';

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

    const db = await connectDB();

    // Find all resources that require verification and are not yet verified (with URL)
    const recursosNoVerificados = await db.collection('recursos')
      .find({
        verificacionRequerida: true,
        verificado: { $ne: true },
        $and: [
          { url: { $exists: true } },
          { url: { $ne: null } },
          { url: { $ne: "" } },
          { url: { $regex: /\S/ } }  // Must contain at least one non-whitespace character
        ]
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate with process and student details
    const recursosConDetalles = await Promise.all(
      recursosNoVerificados.map(async (recurso) => {
        let estudiante = null;
        let usuario = null;

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

    return new Response(JSON.stringify({ recursos: recursosConDetalles }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error fetching unverified resources:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
