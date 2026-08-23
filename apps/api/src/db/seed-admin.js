import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "./db.js";
import { createUser } from "../repositories/users.repository.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

async function seedAdmin() {
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  try {
    const user = await createUser(
      ADMIN_NAME,
      ADMIN_EMAIL,
      passwordHash,
      "ADMIN",
      false,
    );
    console.log(`Seeded admin: ${user.email}`);
  } catch (error) {
    if (error.code === "23505") {
      console.log(`Admin ${ADMIN_EMAIL} already exists — nothing to do.`);
    } else {
      throw error;
    }
  } finally {
    await pool.end();
  }
}

seedAdmin();
