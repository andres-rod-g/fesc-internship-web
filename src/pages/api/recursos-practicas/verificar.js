import { connectDB } from '~/utils/db.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '~/env';
import { ObjectId } from 'mongodb';

export async function POST({ request, cookies }) {
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

    const { recursoId, estado } = await request.json();

    if (!recursoId) {
      return new Response(JSON.stringify({ error: 'Recurso ID is required' }), { status: 400 });
    }

    if (!estado || !['pendiente', 'validado', 'rechazado'].includes(estado)) {
      return new Response(JSON.stringify({ error: 'Estado inválido. Debe ser: pendiente, validado, rechazado' }), { status: 400 });
    }

    const db = await connectDB();

    // Update the resource with new estado
    const result = await db.collection('recursos').updateOne(
      { _id: new ObjectId(recursoId) },
      {
        $set: {
          estado: estado,
          fechaVerificacion: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Recurso not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, estado }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error updating resource estado:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
