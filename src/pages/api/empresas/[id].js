import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    const empresa = await empresasCollection.findOne({ _id: new ObjectId(id) });
    
    if (!empresa) {
      return new Response(
        JSON.stringify({ error: "Empresa no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify(empresa),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al obtener empresa:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT({ params, request }) {
  try {
    const { id } = params;
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
    
    // Verificar si la empresa existe
    const existingEmpresa = await empresasCollection.findOne({ _id: new ObjectId(id) });
    if (!existingEmpresa) {
      return new Response(
        JSON.stringify({ error: "Empresa no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verificar si ya existe otra empresa con el mismo nombre (excluyendo la actual)
    const empresaConMismoNombre = await empresasCollection.findOne({ 
      nombre: data.nombre,
      _id: { $ne: new ObjectId(id) }
    });
    if (empresaConMismoNombre) {
      return new Response(
        JSON.stringify({ error: "Ya existe otra empresa con este nombre" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verificar si ya existe otra empresa con el mismo NIT (si se proporciona)
    if (data.nit) {
      const empresaConMismoNit = await empresasCollection.findOne({ 
        nit: data.nit,
        _id: { $ne: new ObjectId(id) }
      });
      if (empresaConMismoNit) {
        return new Response(
          JSON.stringify({ error: "Ya existe otra empresa con este NIT" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // Preparar datos actualizados
    const updatedData = {
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
      updatedAt: new Date(),
    };
    
    // Actualizar empresa
    const result = await empresasCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    
    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Empresa no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        message: "Empresa actualizada exitosamente",
        empresa: {
          _id: id,
          nombre: updatedData.nombre,
          sector: updatedData.sector,
          tipo_vinculacion: updatedData.tipo_vinculacion
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al actualizar empresa:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE({ params }) {
  try {
    const { id } = params;
    const db = await connectDB();
    const empresasCollection = db.collection("empresas");
    
    // Verificar si la empresa existe
    const empresa = await empresasCollection.findOne({ _id: new ObjectId(id) });
    if (!empresa) {
      return new Response(
        JSON.stringify({ error: "Empresa no encontrada" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Verificar si tiene practicantes asignados
    if (empresa.practicantes_asignados && empresa.practicantes_asignados.length > 0) {
      return new Response(
        JSON.stringify({ error: "No se puede eliminar una empresa con practicantes asignados" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Eliminar empresa
    const result = await empresasCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Error al eliminar la empresa" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ message: "Empresa eliminada exitosamente" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}