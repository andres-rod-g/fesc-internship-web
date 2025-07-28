import { initAdminUser } from "~/utils/initAdmin.js";

export async function GET() {
  await initAdminUser();
  return new Response(
    JSON.stringify({ message: "Usuario administrador inicializado" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
