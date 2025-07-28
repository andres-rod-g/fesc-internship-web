import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";
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

    // Leer la plantilla HTML
    const templatePath = path.join(process.cwd(), 'public', 'cv-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');

    // Función para procesar imágenes
    function processImage(imageData) {
      if (!imageData || !imageData.data) return null;
      try {
        // Las imágenes están almacenadas como base64
        return imageData.data;
      } catch (error) {
        console.error('Error processing image:', error);
        return null;
      }
    }

    // Obtener las imágenes del practicante
    const pictureBase64 = processImage(practicante.foto);
    const signatureBase64 = processImage(practicante.firma_png);

    // Cargar el logo de FESC como base64
    const logoPath = path.join(process.cwd(), 'public', 'fesc-logo.png');
    let fescLogoBase64 = '';
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      fescLogoBase64 = logoBuffer.toString('base64');
    } catch (error) {
      console.error('Error loading FESC logo:', error);
    }

    // Preparar los datos para el template
    const templateData = {
      picture: pictureBase64,
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
      ).join('<br>') || '',
      profile: practicante.perfil_profesional || '',
      tools: practicante.herramientas?.join(', ') || '',
      experience: practicante.experiencia_laboral?.map(exp => 
        `<strong>${exp.empresa || ''}</strong> - ${exp.cargo || ''}<br>
        <em>Período:</em> ${exp.fecha_inicio || ''} - ${exp.fecha_fin || 'Actualidad'}<br>
        ${exp.nombre_jefe ? `<em>Jefe Inmediato:</em> ${exp.nombre_jefe}${exp.cargo_jefe ? ` (${exp.cargo_jefe})` : ''}<br>` : ''}
        ${exp.telefono_empresa ? `<em>Teléfono Empresa:</em> ${exp.telefono_empresa}<br>` : ''}
        ${exp.funciones ? `<em>Funciones:</em> ${exp.funciones}<br>` : ''}
        ${exp.logros ? `<em>Logros:</em> ${exp.logros}<br>` : ''}`
      ).join('<br><br>') || '',
      'sign-image': signatureBase64,
      'doc-from': 'FESC - Fundación de Estudios Superiores Comfanorte',
      'current-date': new Date().toLocaleDateString('es-ES')
    };

    // Reemplazar marcadores en el HTML
    let processedHtml = htmlTemplate;

    // Reemplazar marcadores simples
    Object.keys(templateData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, templateData[key] || '');
    });

    // Procesar condicionales para imágenes
    // {{#if picture}}...{{else}}...{{/if}}
    processedHtml = processedHtml.replace(
      /{{#if picture}}(.*?){{else}}(.*?){{\/if}}/gs,
      pictureBase64 ? '$1' : '$2'
    );

    processedHtml = processedHtml.replace(
      /{{#if sign-image}}(.*?){{else}}(.*?){{\/if}}/gs,
      signatureBase64 ? '$1' : '$2'
    );

    // Reemplazar el logo en el HTML
    processedHtml = processedHtml.replace(
      'src="fesc-logo.png"',
      `src="data:image/png;base64,${fescLogoBase64}"`
    );

    // Crear el nombre del archivo
    const fileName = `CV_${practicante.nombres}_${practicante.apellidos}_${practicante.numero_documento}.html`;
    
    return new Response(processedHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error("Error al generar CV HTML:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}