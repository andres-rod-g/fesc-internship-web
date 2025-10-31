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

    // Find all resources that are not verified
    const recursosNoVerificados = await db.collection('recursos_practicas')
      .find({ verificado: { $ne: true } })
      .sort({ createdAt: -1 })
      .toArray();

    // Populate with student and entry details
    const recursosConDetalles = await Promise.all(
      recursosNoVerificados.map(async (recurso) => {
        // Find the entry that references this resource
        const seguimiento = await db.collection('seguimientos_practicas')
          .findOne({ 'entradas.recursoId': recurso._id.toString() });

        let entrada = null;
        let estudiante = null;

        if (seguimiento) {
          entrada = seguimiento.entradas.find(e => e.recursoId === recurso._id.toString());
          if (entrada) {
            estudiante = await db.collection('estudiantes')
              .findOne({ _id: entrada.estudianteId });
          }
        }

        return {
          ...recurso,
          entrada,
          estudiante
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
