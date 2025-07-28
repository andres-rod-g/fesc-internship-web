import { connectDB } from "~/utils/db.js";
import { ADMIN_USER, ADMIN_PASS, ADMIN_ROLE } from "~/env.ts";
import bcrypt from "bcrypt";

export async function initAdminUser() {
  const db = await connectDB();
  const users = db.collection("users");
  const admin = await users.findOne({ username: ADMIN_USER });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10);
    await users.insertOne({
      username: ADMIN_USER,
      password: hashedPassword,
      role: ADMIN_ROLE,
      createdAt: new Date(),
    });
    console.log("Usuario administrador creado con contraseña hasheada.");
  }
}
