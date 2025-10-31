import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

export async function GET(context) {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const seguimientosCollection = db.collection("seguimientos-practicas");

    const seguimiento = await seguimientosCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!seguimiento) {
      return new Response(
        JSON.stringify({ error: "Seguimiento no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        seguimiento: {
          ...seguimiento,
          _id: seguimiento._id.toString(),
          grupoId: seguimiento.grupoId.toString(),
          entradas: seguimiento.entradas?.map((entrada) => ({
            ...entrada,
            estudianteId: typeof entrada.estudianteId === "string" ? entrada.estudianteId : entrada.estudianteId?.toString(),
            recursoId: typeof entrada.recursoId === "string" ? entrada.recursoId : entrada.recursoId?.toString()
          })) || []
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al obtener seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al obtener el seguimiento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function PUT(context) {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await context.request.json();
    const { _id, grupoId, titulo, descripcion, entradas } = body;

    const db = await connectDB();
    const seguimientosCollection = db.collection("seguimientos-practicas");

    // Construir el objeto de actualización
    const updateObj = {
      updatedAt: new Date()
    };

    // Si se envía título, actualizarlo
    if (titulo !== undefined) {
      updateObj.titulo = titulo;
    }

    // Si se envía descripción, actualizarlo
    if (descripcion !== undefined) {
      updateObj.descripcion = descripcion;
    }

    // Si se envían entradas, reemplazar el array completo
    if (entradas !== undefined) {
      updateObj.entradas = entradas;
    }

    const result = await seguimientosCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateObj
      }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Seguimiento no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Seguimiento actualizado exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al actualizar seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al actualizar el seguimiento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(context) {
  try {
    const { id } = context.params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "ID inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const seguimientosCollection = db.collection("seguimientos-practicas");
    const recursosCollection = db.collection("recursos");

    // Primero obtener el seguimiento para obtener los IDs de recursos
    const seguimiento = await seguimientosCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!seguimiento) {
      return new Response(
        JSON.stringify({ error: "Seguimiento no encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Eliminar todos los recursos asociados
    if (seguimiento.entradas && seguimiento.entradas.length > 0) {
      const recursoIds = seguimiento.entradas
        .map((entrada) => entrada.recursoId)
        .filter((id) => id && ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

      if (recursoIds.length > 0) {
        await recursosCollection.deleteMany({
          _id: { $in: recursoIds }
        });
      }
    }

    // Finalmente eliminar el seguimiento
    const result = await seguimientosCollection.deleteOne({
      _id: new ObjectId(id)
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Seguimiento y sus recursos eliminados exitosamente"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error al eliminar seguimiento:", error);
    return new Response(
      JSON.stringify({ error: "Error al eliminar el seguimiento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
