import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    // Buscar el practicante por ID
    const practicante = await practicantesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!practicante || !practicante.firma_png) {
      return new Response("Firma no encontrada", { status: 404 });
    }

    // Obtener los datos de la firma
    const firmaData = practicante.firma_png;
    
    // Convertir base64 a buffer
    const imageBuffer = Buffer.from(firmaData.data, 'base64');
    
    // Retornar la imagen
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': firmaData.contentType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
      },
    });
  } catch (error) {
    console.error("Error al obtener firma:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}