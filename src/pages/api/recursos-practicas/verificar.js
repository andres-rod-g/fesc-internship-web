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

    const { recursoId } = await request.json();

    if (!recursoId) {
      return new Response(JSON.stringify({ error: 'Recurso ID is required' }), { status: 400 });
    }

    const db = await connectDB();

    // Update the resource to mark as verified
    const result = await db.collection('recursos').updateOne(
      { _id: new ObjectId(recursoId) },
      {
        $set: {
          verificado: true,
          fechaVerificacion: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: 'Recurso not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Error verifying resource:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
