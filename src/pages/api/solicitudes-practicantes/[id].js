import { connectDB } from "~/utils/db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "~/env";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const token = context.cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (user.role !== "director" && user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = context.params;
    const db = await connectDB();
    const collection = db.collection("solicitudes_practicantes");

    const solicitud = await collection.findOne({ _id: new ObjectId(id) });

    if (!solicitud) {
      return new Response(
        JSON.stringify({ error: "Solicitud no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(solicitud),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener solicitud:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PATCH(context) {
  try {
    const token = context.cookies.get("token")?.value;
    if (!token) {
      return new Response(
        JSON.stringify({ error: "No autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let user;
    try {
      user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (user.role !== "director" && user.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "No tienes permiso" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const { id } = context.params;
    const body = await context.request.json();

    // Validate that id is a valid MongoDB ObjectId
    if (!id || typeof id !== "string") {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const solicitudCollection = db.collection("solicitudes_practicantes");

    // Get the solicitud details for empresa creation if needed
    let solicitud;
    try {
      solicitud = await solicitudCollection.findOne({ _id: new ObjectId(id) });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "ID de solicitud inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!solicitud) {
      return new Response(
        JSON.stringify({ error: "Solicitud no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // If approval with empresa creation is requested
    if (body.crearEmpresa && body.estado === "aprobada") {
      try {
        const empresasCollection = db.collection("empresas");

        // Create new empresa from solicitud data
        const nuevaEmpresa = {
          nombre: solicitud.nombre_empresa,
          nit: solicitud.nit,
          sector_economico: solicitud.sector_economico,
          tamano_empresa: solicitud.tamano_empresa,
          actividad_economica: solicitud.actividad_economica,
          direccion: solicitud.direccion,
          telefonos: solicitud.telefonos,
          pagina_web: solicitud.pagina_web || "",
          representante_legal: solicitud.representante_legal,
          nombre_responsable: solicitud.nombre_responsable,
          cargo_responsable: solicitud.cargo_responsable,
          correo_responsable: solicitud.correo_responsable,
          telefono_responsable: solicitud.telefono_responsable,
          convenio_vigente: solicitud.convenio_vigente,
          solicitud_id: new ObjectId(id),
          practicantes_asignados: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const empresaResult = await empresasCollection.insertOne(nuevaEmpresa);

        // Update solicitud with empresa_id
        await solicitudCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              estado: body.estado,
              notas_director: body.notas_director || "",
              updatedAt: new Date(),
              director_id: user.id,
              empresa_id: empresaResult.insertedId
            }
          }
        );

        return new Response(
          JSON.stringify({
            success: true,
            message: "Solicitud aprobada. Empresa creada exitosamente.",
            empresa_id: empresaResult.insertedId
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (empresaError) {
        console.error("Error al crear empresa:", empresaError);
        return new Response(
          JSON.stringify({ error: "Error al crear la empresa" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Standard solicitud update without empresa creation
    const result = await solicitudCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          estado: body.estado,
          notas_director: body.notas_director || "",
          updatedAt: new Date(),
          director_id: user.id
        }
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Solicitud no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si se aprueba la solicitud, crear el proceso de prácticas automáticamente
    if (body.estado === "aprobada" && solicitud.estudiante_id) {
      try {
        const procesoPracticasCollection = db.collection("proceso-practicas");

        // Verificar que no exista ya un proceso
        const procesoExistente = await procesoPracticasCollection.findOne({
          estudianteId: new ObjectId(solicitud.estudiante_id)
        });

        if (!procesoExistente) {
          const nuevoProces = {
            estudianteId: new ObjectId(solicitud.estudiante_id),
            practicanteId: solicitud.practicante_id ? new ObjectId(solicitud.practicante_id) : null,
            esConsultoria: false,

            // Evaluación de Práctica
            evaluacion: {
              nota1: null,
              nota2: null,
              nota3: null,
              nota4: null,
              enlace: "",
              notasAdicionales: ""
            },

            // Seguimiento
            seguimiento: {
              enlace: "",
              nota: null,
              esVerificable: true,
              verificado: false
            },

            // Auto-evaluación
            autoevaluacion: {
              enlace: "",
              nota: null,
              esVerificable: false,
              verificado: false
            },

            // ARL
            arl: {
              enlace: "",
              nota: null,
              esVerificable: true,
              verificado: false
            },

            // URL Certificado
            certificado: {
              enlace: "",
              nota: null,
              esVerificable: true,
              verificado: false
            },

            // Conjunto ATLAS
            atlas: {
              autorizacionDocente: {
                enlace: "",
                verificado: false
              },
              autorizacionEstudiante: {
                enlace: "",
                verificado: false
              },
              relacionTrabos: {
                enlace: "",
                verificado: false
              }
            },

            // Anexos y Agenda
            anexos: [],
            agenda: [],

            createdAt: new Date(),
            updatedAt: new Date()
          };

          await procesoPracticasCollection.insertOne(nuevoProces);
        }
      } catch (procesoError) {
        console.error("Error al crear proceso de prácticas:", procesoError);
        // No fallar la solicitud si hay error al crear el proceso
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Solicitud actualizada" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar solicitud" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
