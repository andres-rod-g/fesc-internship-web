import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

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

    // Crear contenido HTML para el PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CV - ${practicante.nombres} ${practicante.apellidos}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            background-color: #f4f4f4;
            padding: 10px;
            font-weight: bold;
            font-size: 18px;
            border-left: 4px solid #333;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        .info-item {
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            color: #555;
        }
        .tool-tag {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 12px;
        }
        .experience-item {
            border-left: 3px solid #ddd;
            padding-left: 15px;
            margin-bottom: 20px;
        }
        @media print {
            body { margin: 0; padding: 15px; font-size: 12px; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${practicante.nombres} ${practicante.apellidos}</h1>
        <p><strong>${practicante.programa} - ${practicante.ciclo}</strong></p>
        <p>${practicante.correo_institucional} | ${practicante.telefono_celular}</p>
        ${practicante.modalidad?.length ? `<p>Modalidad: ${practicante.modalidad.join(', ')}</p>` : ''}
    </div>

    <div class="section">
        <div class="section-title">INFORMACIÓN PERSONAL</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Documento:</span> ${practicante.tipo_documento} ${practicante.numero_documento}
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de Nacimiento:</span> ${practicante.fecha_nacimiento || 'No especificada'}
            </div>
            <div class="info-item">
                <span class="info-label">Lugar de Nacimiento:</span> ${practicante.lugar_nacimiento || 'No especificado'}
            </div>
            <div class="info-item">
                <span class="info-label">Teléfono Fijo:</span> ${practicante.telefono_fijo || 'No especificado'}
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Dirección:</span> ${practicante.direccion_residencia || 'No especificada'}
            </div>
            <div class="info-item">
                <span class="info-label">Correo Personal:</span> ${practicante.correo_personal || 'No especificado'}
            </div>
        </div>
    </div>

    ${practicante.perfil_profesional ? `
    <div class="section">
        <div class="section-title">PERFIL PROFESIONAL</div>
        <p>${practicante.perfil_profesional}</p>
    </div>
    ` : ''}

    ${practicante.informacion_academica?.length > 0 ? `
    <div class="section">
        <div class="section-title">INFORMACIÓN ACADÉMICA</div>
        ${practicante.informacion_academica.map(edu => `
        <div class="info-item">
            <strong>${edu.tipo}</strong> - ${edu.institucion}<br>
            <em>${edu.titulo}</em> (${edu.anio_finalizacion})
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${practicante.herramientas?.length > 0 ? `
    <div class="section">
        <div class="section-title">HERRAMIENTAS</div>
        <div>
            ${practicante.herramientas.map(tool => `<span class="tool-tag">${tool}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${practicante.experiencia_laboral?.length > 0 ? `
    <div class="section">
        <div class="section-title">EXPERIENCIA LABORAL</div>
        ${practicante.experiencia_laboral.map(exp => `
        <div class="experience-item">
            <h4>${exp.empresa} - ${exp.cargo}</h4>
            <p><strong>Período:</strong> ${exp.fecha_inicio} - ${exp.fecha_fin || 'Actualidad'}</p>
            ${exp.nombre_jefe ? `<p><strong>Jefe Inmediato:</strong> ${exp.nombre_jefe}${exp.cargo_jefe ? ` (${exp.cargo_jefe})` : ''}</p>` : ''}
            ${exp.telefono_empresa ? `<p><strong>Teléfono Empresa:</strong> ${exp.telefono_empresa}</p>` : ''}
            ${exp.funciones ? `<p><strong>Funciones:</strong> ${exp.funciones}</p>` : ''}
            ${exp.logros ? `<p><strong>Logros:</strong> ${exp.logros}</p>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">INFORMACIÓN DEL SISTEMA</div>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Estado:</span> ${practicante.estado || 'Pendiente'}
            </div>
            <div class="info-item">
                <span class="info-label">Fecha de Registro:</span> ${practicante.createdAt ? new Date(practicante.createdAt).toLocaleDateString('es-ES') : 'No disponible'}
            </div>
        </div>
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} - FESC</p>
    </div>
</body>
</html>
    `;

    // Crear el archivo de respuesta
    const fileName = `CV_${practicante.nombres}_${practicante.apellidos}.html`;
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error("Error al generar PDF:", error);
    return new Response("Error interno del servidor", { status: 500 });
  }
}