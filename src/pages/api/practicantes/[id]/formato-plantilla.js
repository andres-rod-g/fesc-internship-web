import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module";
import fs from "fs";
import path from "path";

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");

    // Buscar el practicante
    const practicante = await practicantesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!practicante) {
      return new Response("Practicante no encontrado", { status: 404 });
    }

    // Leer el template de Word
    const templatePath = path.join(process.cwd(), 'public', 'hv.docx');
    const templateBuffer = fs.readFileSync(templatePath);

    // Cargar el archivo zip
    const zip = new PizZip(templateBuffer);

    // Función para obtener imágenes desde la base de datos
    async function getImageBuffer(imageData, practicanteId) {
      if (!imageData || !imageData.data) return null;
      
      try {
        // Las imágenes están almacenadas como base64 en la propiedad 'data'
        return Buffer.from(imageData.data, 'base64');
      } catch (error) {
        console.error('Error loading image:', error);
        return null;
      }
    }

    // Obtener las imágenes del practicante
    const pictureBuffer = await getImageBuffer(practicante.foto, practicante._id);
    const signatureBuffer = await getImageBuffer(practicante.firma_png, practicante._id);

    // Configuración del módulo de imágenes con versión compatible
    const imageOpts = {
      getImage(tagValue, tagName) {
        console.log('getImage:', { tagValue: tagValue ? 'Buffer presente' : 'Sin buffer', tagName });
        // tagValue ahora es directamente el buffer o null
        return tagValue;
      },
      getSize(img, tagValue, tagName) {
        console.log('getSize:', { tagName });
        if (tagName === 'picture') {
          return [150, 150];
        }
        if (tagName === 'sign-image') {
          return [200, 100];
        }
        return [100, 100];
      }
    };

    // Crear el generador de documentos con módulo de imágenes
    const imageModule = new ImageModule(imageOpts);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule]
    });

    // Preparar los datos para el template
    const templateData = {
      picture: pictureBuffer || null,
      program: practicante.programa || '',
      name: practicante.nombres || '',
      lastname: practicante.apellidos || '',
      'doc-number': practicante.numero_documento || '',
      'doc-type': practicante.tipo_documento || '',
      'b-day': practicante.fecha_nacimiento || '',
      'b-place': practicante.lugar_nacimiento || '',
      address: practicante.direccion_residencia || '',
      telephone: practicante.telefono_fijo || '',
      phone: practicante.telefono_celular || '',
      'i-email': practicante.correo_institucional || '',
      'p-email': practicante.correo_personal || '',
      'academic-info': practicante.informacion_academica?.map(edu => 
        `${edu.tipo || ''} - ${edu.titulo || ''} (${edu.institucion || ''}, ${edu.anio_finalizacion || ''})`
      ).join('\n') || '',
      profile: practicante.perfil_profesional || '',
      tools: practicante.herramientas?.join(', ') || '',
      experience: practicante.experiencia_laboral?.map(exp => 
        `${exp.empresa || ''} - ${exp.cargo || ''} (${exp.fecha_inicio || ''} - ${exp.fecha_fin || 'Actualidad'})`
      ).join('\n') || '',
      'sign-image': signatureBuffer || null,
      'doc-from': 'FESC - Fundación de Estudios Superiores Comfanorte',
      'current-date': new Date().toLocaleDateString('es-ES')
    };

    console.log('Template data:', templateData);

    // Reemplazar los datos en el template
    try {
      doc.render(templateData);
    } catch (renderError) {
      console.error('Error rendering template:', renderError);
      console.log('Template tags found:', doc.getFullText());
      throw new Error(`Error al procesar el template: ${renderError.message}`);
    }

    // Generar el archivo
    const output = doc.getZip().generate({
      type: 'nodebuffer',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    // Crear el nombre del archivo
    const fileName = `CV_${practicante.nombres}_${practicante.apellidos}_${practicante.numero_documento}.docx`;
    
    return new Response(output, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error("Error al generar formato:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}