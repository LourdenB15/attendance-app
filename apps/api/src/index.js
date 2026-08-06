import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
