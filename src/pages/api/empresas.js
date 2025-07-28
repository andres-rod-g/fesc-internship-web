import { connectDB } from "~/utils/db.js";

export async function POST({ request }) {
  try {
    const data = await request.json();
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    // Validar campos requeridos
    if (!data.nombre) {
      return new Response(
        JSON.stringify({ error: "El nombre de la empresa es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!data.tipo_vinculacion) {
      return new Response(
        JSON.stringify({ error: "El tipo de vinculación es obligatorio" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verificar si ya existe una empresa con el mismo nombre
    const existingEmpresa = await empresasCollection.findOne({ nombre: data.nombre });
    if (existingEmpresa) {
      return new Response(
        JSON.stringify({ error: "Ya existe una empresa con este nombre" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Crear nueva empresa
    const newEmpresa = {
      nombre: data.nombre,
      nit: data.nit || null,
      sector: data.sector || null,
      tamaño: data.tamaño || null,
      tipo_vinculacion: data.tipo_vinculacion,
      direccion: data.direccion || null,
      telefono: data.telefono || null,
      email: data.email || null,
      sitio_web: data.sitio_web || null,
      contacto_nombre: data.contacto_nombre || null,
      contacto_cargo: data.contacto_cargo || null,
      contacto_telefono: data.contacto_telefono || null,
      contacto_email: data.contacto_email || null,
      descripcion: data.descripcion || null,
      areas_practica: data.areas_practica || null,
      max_practicantes: data.max_practicantes || null,
      
      // Estadísticas
      practicantes_asignados: [],
      total_practicantes: 0,
      activos: 0,
      completados: 0,
      pendientes: 0,
      
      // Metadatos
      estado: "activa",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await empresasCollection.insertOne(newEmpresa);
    
    return new Response(
      JSON.stringify({ 
        message: "Empresa creada exitosamente", 
        empresa: {
          _id: result.insertedId,
          nombre: newEmpresa.nombre,
          sector: newEmpresa.sector
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al crear empresa:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET() {
  try {
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    const empresas = await empresasCollection.find({}).toArray();
    
    return new Response(
      JSON.stringify(empresas),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al obtener empresas:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}