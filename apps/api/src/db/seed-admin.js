import "dotenv/config";
import pool from "./db.js";
import { ensureAdminAccount } from "../services/admin.service.js";

// Same setup the API runs on every start; handy for a fresh database
async function seedAdmin() {
  try {
    await ensureAdminAccount();
  } finally {
    await pool.end();
  }
}

seedAdmin();
