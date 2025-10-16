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

    const db = await connectDB();
    const collection = db.collection("solicitudes_practicantes");

    const result = await collection.updateOne(
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
