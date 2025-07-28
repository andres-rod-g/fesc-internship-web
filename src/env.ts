import dotenv from "dotenv"

dotenv.config()

interface ImportMetaEnv {
  readonly MONGO_URL: string;
  readonly DB_NAME: string;
  readonly ADMIN_USER: string;
  readonly ADMIN_PASS: string;
  readonly ADMIN_ROLE: string;
  readonly JWT_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
export const DB_NAME = process.env.DB_NAME || "fesc_platform";
export const ADMIN_USER = process.env.ADMIN_USER || "admin";
export const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
export const ADMIN_ROLE = process.env.ADMIN_ROLE || "admin";
export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
