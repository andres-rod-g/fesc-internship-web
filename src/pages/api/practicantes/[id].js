import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function PUT({ params, request }) {
  try {
    const { id } = params;
    
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    
    let data, formData;
    
    // Verificar si es FormData (con archivos) o JSON
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('multipart/form-data')) {
      formData = await request.formData();
      data = JSON.parse(formData.get('data'));
    } else {
      data = await request.json();
    }
    
    // Validar campos requeridos
    const { programa, ciclo, modalidad, nombres, apellidos, numero_documento, correo_institucional } = data;
    
    if (!programa || !ciclo || !modalidad?.length || !nombres || !apellidos || !numero_documento || !correo_institucional) {
      return new Response(
        JSON.stringify({ error: "Los campos marcados con * son obligatorios" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verificar si ya existe otro practicante con el mismo número de documento
    const existingPracticante = await practicantesCollection.findOne({ 
      numero_documento,
      _id: { $ne: new ObjectId(id) }
    });
    
    if (existingPracticante) {
      return new Response(
        JSON.stringify({ error: "Ya existe otro practicante registrado con este número de documento" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Actualizar datos del practicante
    const updateData = {
      programa,
      ciclo,
      modalidad,
      nombres,
      apellidos,
      tipo_documento: data.tipo_documento,
      numero_documento,
      fecha_nacimiento: data.fecha_nacimiento,
      lugar_nacimiento: data.lugar_nacimiento,
      direccion_residencia: data.direccion_residencia,
      telefono_fijo: data.telefono_fijo,
      telefono_celular: data.telefono_celular,
      correo_institucional,
      correo_personal: data.correo_personal,
      perfil_profesional: data.perfil_profesional,
      updatedAt: new Date()
    };

    // Manejar foto si se envió
    if (formData) {
      const fotoFile = formData.get('foto');
      const eliminarFoto = formData.get('eliminarFoto');
      
      if (eliminarFoto === 'true') {
        updateData.foto = null;
      } else if (fotoFile && fotoFile.size > 0) {
        const fotoBuffer = await fotoFile.arrayBuffer();
        updateData.foto = {
          data: Buffer.from(fotoBuffer),
          contentType: fotoFile.type
        };
      }

      // Manejar firma si se envió
      const firmaFile = formData.get('firma');
      const eliminarFirma = formData.get('eliminarFirma');
      
      if (eliminarFirma === 'true') {
        updateData.firma_png = null;
      } else if (firmaFile && firmaFile.size > 0) {
        const firmaBuffer = await firmaFile.arrayBuffer();
        updateData.firma_png = {
          data: Buffer.from(firmaBuffer),
          contentType: 'image/png'
        };
      }
    }
    
    const result = await practicantesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Practicante actualizado exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al actualizar practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    
    const practicante = await practicantesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(practicante),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al obtener practicante:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}