import express from "express";
import propertiesRoutes from "./modules/properties/properties.routes.js";

const app = express();

app.use(express.json());

// ✅ TEST
app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

// ✅ TU RUTA DE LA T5 (IMPORTANTE)
app.use("/api", propertiesRoutes);

// (opcional) puedes dejar tu endpoint de users
app.post("/api/users", (req, res) => {
  const user = req.body;

  res.json({
    message: "User created",
    user,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});