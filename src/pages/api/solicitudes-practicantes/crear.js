import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

const RATE_LIMIT = 10; // max requests
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes
const ipRequests = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }

  const requests = ipRequests.get(ip);
  const recentRequests = requests.filter(time => now - time < RATE_WINDOW);

  if (recentRequests.length >= RATE_LIMIT) {
    const oldestRequest = recentRequests[0];
    const retryAfter = Math.ceil((oldestRequest + RATE_WINDOW - now) / 1000);
    return {
      allowed: false,
      retryAfter
    };
  }

  recentRequests.push(now);
  ipRequests.set(ip, recentRequests);
  return { allowed: true };
}

export async function POST(context) {
  const ip = context.clientAddress || context.request.headers.get('x-forwarded-for') || 'unknown';

  const rateLimitCheck = checkRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    return new Response(
      JSON.stringify({
        code: "RATE_LIMIT_EXCEEDED",
        error: "Has alcanzado el límite de solicitudes",
        details: {
          message: `Máximo 10 solicitudes cada 5 minutos`,
          retryAfter: rateLimitCheck.retryAfter
        }
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body = await context.request.json();

    // Validar campos requeridos
    if (!body.nombre_empresa || !body.nit || !body.nombre_responsable ||
        !body.correo_responsable || !body.solicitudes_practicantes ||
        body.solicitudes_practicantes.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Faltan campos obligatorios"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const collection = db.collection("solicitudes_practicantes");

    const solicitud = {
      // Datos Empresa
      nombre_empresa: body.nombre_empresa,
      representante_legal: body.representante_legal,
      nit: body.nit,
      actividad_economica: body.actividad_economica,
      sector_economico: body.sector_economico,
      nacionalidad: body.nacionalidad,
      tamano_empresa: body.tamano_empresa,
      pagina_web: body.pagina_web || null,
      direccion: body.direccion,
      telefonos: body.telefonos,
      convenio_vigente: body.convenio_vigente,

      // Datos Contacto
      nombre_responsable: body.nombre_responsable,
      cargo_responsable: body.cargo_responsable,
      correo_responsable: body.correo_responsable,
      telefono_responsable: body.telefono_responsable,

      // Solicitudes de Practicantes
      solicitudes_practicantes: body.solicitudes_practicantes,

      // Metadatos
      estado: "pendiente_revision", // pendiente_revision, en_revision, aprobada, rechazada
      createdAt: new Date(),
      updatedAt: new Date(),
      ip_origen: ip
    };

    const result = await collection.insertOne(solicitud);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Solicitud guardada exitosamente",
        solicitudId: result.insertedId.toString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error al guardar solicitud:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
