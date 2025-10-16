import { connectDB } from "~/utils/db.js";
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

    // VALIDACIÓN TEMPRANA - Antes de procesar archivos
    const programa = formData.get('programa');
    const ciclo = formData.get('ciclo');
    const modalidad = JSON.parse(formData.get('modalidad') || '[]');
    const nombres = formData.get('nombres');
    const apellidos = formData.get('apellidos');
    const tipo_documento = formData.get('tipo_documento');
    const numero_documento = formData.get('numero_documento');
    const correo_institucional = formData.get('correo_institucional');
    const estado_laboral = formData.get('estado_laboral');

    // Validar campos requeridos ANTES
    if (!programa || !ciclo || !modalidad?.length || !nombres || !apellidos || !numero_documento || !correo_institucional || !estado_laboral || !tipo_documento) {
      return new Response(
        JSON.stringify({ error: "Los campos marcados con * son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validar que la foto existe ANTES de procesarla
    const fotoFile = formData.get('foto');
    if (!fotoFile || fotoFile.size === 0) {
      return new Response(
        JSON.stringify({ error: "La foto es obligatoria" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Conectar a BD DESPUÉS de validaciones básicas
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    // Verificar unicidad del documento ANTES de procesar archivos pesados
    const existingPracticante = await practicantesCollection.findOne({ numero_documento });
    if (existingPracticante) {
      return new Response(
        JSON.stringify({ error: "Ya existe una preinscripción con este número de documento" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // AHORA procesar archivos
    let foto_data = null;
    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      foto_data = {
        data: base64,
        contentType: fotoFile.type,
        filename: fotoFile.name,
        size: fotoFile.size,
        uploadDate: new Date()
      };
    }

    const firmaFile = formData.get('firma_png');
    let firma_png_data = null;

    if (firmaFile && firmaFile.size > 0) {
      const arrayBuffer = await firmaFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      firma_png_data = {
        data: base64,
        contentType: firmaFile.type,
        filename: firmaFile.name,
        size: firmaFile.size,
        uploadDate: new Date()
      };
    }

    // Obtener datos restantes
    const fecha_nacimiento = formData.get('fecha_nacimiento');
    const lugar_nacimiento = formData.get('lugar_nacimiento');
    const direccion_residencia = formData.get('direccion_residencia');
    const telefono_fijo = formData.get('telefono_fijo');
    const telefono_celular = formData.get('telefono_celular');
    const correo_personal = formData.get('correo_personal');
    const perfil_profesional = formData.get('perfil_profesional');

    const informacion_academica = JSON.parse(formData.get('informacion_academica') || '[]');
    const herramientas = JSON.parse(formData.get('herramientas') || '[]');
    const experiencia_laboral = JSON.parse(formData.get('experiencia_laboral') || '[]');

    const newPracticante = {
      programa,
      ciclo,
      modalidad,
      foto: foto_data,
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      fecha_nacimiento,
      lugar_nacimiento,
      direccion_residencia,
      telefono_fijo,
      telefono_celular,
      correo_institucional,
      correo_personal,
      estado_laboral,
      informacion_academica,
      perfil_profesional,
      herramientas: herramientas.filter(h => h.trim() !== ''),
      experiencia_laboral,
      firma_png: firma_png_data,

      estado_preinscripcion: "preinscrito",

      validacion_pago: {
        comprobante_url: null,
        fecha_subida: null,
        estado: null,
        validado_por: null,
        fecha_validacion: null,
        comentarios: null
      },

      estudiante_info: {
        usuario_id: null,
        fecha_creacion: null,
        creado_por: null
      },

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await practicantesCollection.insertOne(newPracticante);

    return new Response(
      JSON.stringify({
        message: "Preinscripción registrada exitosamente",
        id: result.insertedId,
        practicante: {
          nombres,
          apellidos,
          numero_documento,
          programa,
          estado_preinscripcion: newPracticante.estado_preinscripcion
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al registrar preinscripción:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
