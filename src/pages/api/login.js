import { connectDB } from "~/utils/db.js";
import { JWT_SECRET } from "~/env.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function POST({ request }) {
  const { username, password } = await request.json();
  const db = await connectDB();
  const users = db.collection("users");
  const user = await users.findOne({ username });

  const isPasswordValid = user && await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return new Response(
      JSON.stringify({ error: "Credenciales inválidas" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  return new Response(
    JSON.stringify({ token }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
