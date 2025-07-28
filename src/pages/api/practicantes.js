import { connectDB } from "~/utils/db.js";

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    // Extraer datos del formulario
    const programa = formData.get('programa');
    const ciclo = formData.get('ciclo');
    const modalidad = JSON.parse(formData.get('modalidad') || '[]');
    const nombres = formData.get('nombres');
    const apellidos = formData.get('apellidos');
    const tipo_documento = formData.get('tipo_documento');
    const numero_documento = formData.get('numero_documento');
    const fecha_nacimiento = formData.get('fecha_nacimiento');
    const lugar_nacimiento = formData.get('lugar_nacimiento');
    const direccion_residencia = formData.get('direccion_residencia');
    const telefono_fijo = formData.get('telefono_fijo');
    const telefono_celular = formData.get('telefono_celular');
    const correo_institucional = formData.get('correo_institucional');
    const correo_personal = formData.get('correo_personal');
    const perfil_profesional = formData.get('perfil_profesional');
    
    // Parsear arrays JSON
    const informacion_academica = JSON.parse(formData.get('informacion_academica') || '[]');
    const herramientas = JSON.parse(formData.get('herramientas') || '[]');
    const experiencia_laboral = JSON.parse(formData.get('experiencia_laboral') || '[]');
    
    // Manejar archivo de foto (guardar en MongoDB como base64)
    const fotoFile = formData.get('foto');
    let foto_data = null;
    
    if (fotoFile && fotoFile.size > 0) {
      // Convertir archivo a base64 para guardar en MongoDB
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
    
    // Manejar archivo de firma (guardar en MongoDB como base64)
    const firmaFile = formData.get('firma_png');
    let firma_png_data = null;
    
    if (firmaFile && firmaFile.size > 0) {
      // Convertir archivo a base64 para guardar en MongoDB
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

    // Crear documento de hoja de vida
    const newPracticante = {
      // Información Personal
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
      
      // Información Académica
      informacion_academica,
      
      // Perfil Profesional
      perfil_profesional,
      
      // Herramientas
      herramientas: herramientas.filter(h => h.trim() !== ''), // Filtrar vacíos
      
      // Experiencia Laboral
      experiencia_laboral,
      
      // Firma Digital
      firma_png: firma_png_data,
      
      // Metadatos
      estado: "pendiente", // Estado inicial
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validar campos requeridos
    if (!programa || !ciclo || !modalidad?.length || !foto_data || !nombres || !apellidos || !numero_documento || !correo_institucional) {
      return new Response(
        JSON.stringify({ error: "Los campos marcados con * son obligatorios (incluyendo la foto)" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar si ya existe un practicante con el mismo número de documento
    const existingPracticante = await practicantesCollection.findOne({ numero_documento });
    if (existingPracticante) {
      return new Response(
        JSON.stringify({ error: "Ya existe un practicante registrado con este número de documento" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    await practicantesCollection.insertOne(newPracticante);

    return new Response(
      JSON.stringify({ 
        message: "Hoja de vida registrada exitosamente", 
        practicante: {
          nombres,
          apellidos,
          numero_documento,
          programa,
          estado: newPracticante.estado
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al registrar hoja de vida:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
