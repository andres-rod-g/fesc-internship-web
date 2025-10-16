import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
import { checkRateLimit, getClientIP } from "~/utils/rateLimiter.js";

export async function POST({ request }) {
  try {
    // Rate limiting primero (antes de procesar FormData)
    const clientIP = getClientIP(request);
    const rateLimitCheck = checkRateLimit(clientIP, 30, 5 * 60 * 1000);

    if (!rateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "Demasiadas solicitudes desde tu dirección IP",
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            message: `Se han alcanzado el máximo de ${rateLimitCheck.maxRequests} solicitudes en ${rateLimitCheck.windowSeconds} segundos.`,
            retryAfter: rateLimitCheck.retryAfter,
            remaining: 0
          }
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": rateLimitCheck.retryAfter
          }
        }
      );
    }

    const formData = await request.formData();

    // VALIDACIÓN TEMPRANA
    const practicante_id = formData.get('practicante_id');
    const comprobanteFile = formData.get('comprobante');

    if (!practicante_id || !comprobanteFile || comprobanteFile.size === 0) {
      return new Response(
        JSON.stringify({ error: "ID de practicante y comprobante son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar tamaño ANTES de procesar
    if (comprobanteFile.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "El archivo debe ser menor a 5MB" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar tipo ANTES de procesar
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(comprobanteFile.type)) {
      return new Response(
        JSON.stringify({ error: "El archivo debe ser una imagen (JPG, PNG) o PDF" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // DESPUÉS de validaciones, conectar a BD
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    const practicante = await practicantesCollection.findOne({
      _id: new ObjectId(practicante_id)
    });

    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (practicante.estado_preinscripcion !== "preinscrito") {
      return new Response(
        JSON.stringify({ error: "El practicante no está en estado válido para subir comprobante" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // AHORA procesar archivo
    const arrayBuffer = await comprobanteFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    const comprobante_data = {
      data: base64,
      contentType: comprobanteFile.type,
      filename: comprobanteFile.name,
      size: comprobanteFile.size,
      uploadDate: new Date()
    };

    await practicantesCollection.updateOne(
      { _id: new ObjectId(practicante_id) },
      {
        $set: {
          estado_preinscripcion: "pago_pendiente",
          "validacion_pago.comprobante_url": comprobante_data,
          "validacion_pago.fecha_subida": new Date(),
          "validacion_pago.estado": "pendiente",
          updatedAt: new Date()
        }
      }
    );

    return new Response(
      JSON.stringify({
        message: "Comprobante subido exitosamente. Espera la validación del administrador.",
        estado: "pago_pendiente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al subir comprobante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
