import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import cors from "cors";
import { apiLimiter } from "./middleware/rate-limit.js";
import { ensureAdminAccount } from "./services/admin.service.js";

const PORT = process.env.PORT;
const app = express();
app.set("trust proxy", 1);
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().replace(/\/$/, ""))
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// Disable browser caching for all API responses so UI always gets live data
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.use("/api", apiLimiter, routes);

// Make sure the admin from .env can sign in; a failure here shouldn't stop the API
try {
  await ensureAdminAccount();
} catch (error) {
  console.error("Admin setup failed:", error);
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
