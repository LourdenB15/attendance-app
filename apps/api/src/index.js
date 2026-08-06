import express from "express";
const PORT = 5000;
const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
