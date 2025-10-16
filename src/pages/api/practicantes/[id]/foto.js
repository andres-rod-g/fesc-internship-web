import { connectDB } from "~/utils/db.js";
import { ObjectId } from "mongodb";

// Colors for avatar background
const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#AED6F1"
];

function getColorByName(nombres) {
  // Generate a consistent color based on name
  let hash = 0;
  if (nombres) {
    for (let i = 0; i < nombres.length; i++) {
      hash = nombres.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const colorIndex = Math.abs(hash) % COLORS.length;
  return COLORS[colorIndex];
}

function generateAvatarSVG(nombres = "?", apellidos = "") {
  // Get first 2 letters (first letter of nombre + first letter of apellido)
  let initials = (nombres.charAt(0) || "?") + (apellidos.charAt(0) || "");
  initials = initials.toUpperCase();

  const bgColor = getColorByName(nombres);

  // Create SVG avatar
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${bgColor}"/>
      <text x="100" y="115" font-size="80" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">
        ${initials}
      </text>
    </svg>
  `;

  return svg;
}

export async function GET({ params }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ error: "Invalid practicante ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = await connectDB();
    const practicantesCollection = db.collection("practicantes");
    const practicante = await practicantesCollection.findOne({
      _id: new ObjectId(id)
    });

    if (!practicante) {
      return new Response(
        JSON.stringify({ error: "Practicante not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // If practicante has a photo, return it
    if (practicante.foto && practicante.foto.data) {
      const fotoData = practicante.foto;
      const imageBuffer = Buffer.from(fotoData.data, "base64");

      return new Response(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": fotoData.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=31536000" // Cache 1 year
        }
      });
    }

    // If no photo, generate avatar with initials
    const avatarSVG = generateAvatarSVG(practicante.nombres, practicante.apellidos);

    return new Response(avatarSVG, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml;charset=utf-8",
        "Cache-Control": "public, max-age=31536000"
      }
    });
  } catch (error) {
    console.error("Error al obtener foto:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
