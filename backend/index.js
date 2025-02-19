const express = require("express");
const cors = require("cors");
const knex = require("knex");
require("dotenv").config();



const multer = require("multer");
const path = require("path");

// Configuración de Multer para almacenar imágenes en la carpeta "img"
const storage = multer.diskStorage({
  destination: "img/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// Configuración de la base de datos con Knex
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/img", express.static("img"));

// ✅ Obtener todas las waifus
app.get("/waifus", async (req, res) => {
  try {
    const waifus = await db("waifus").select("*");
    res.json(waifus);
  } catch (error) {
    console.error("Error obteniendo waifus:", error);
    res.status(500).json({ error: "Error obteniendo waifus" });
  }
});

// ✅ Agregar una nueva waifu
app.post("/waifus", upload.single("imagen"), async (req, res) => {
    try {
      const { nombre, codename, persona } = req.body;
      const imagen = req.file ? `http://localhost:5000/img/${req.file.filename}` : null;

  
      if (!nombre || !codename || !persona || !imagen) {
        return res.status(400).json({ error: "Faltan datos" });
      }
  
      const nuevaWaifu = await db("waifus")
        .insert({ nombre, codename, persona, imagen })
        .returning("*");
  
      res.status(201).json(nuevaWaifu[0]);
    } catch (error) {
      console.error("Error al agregar waifu:", error);
      res.status(500).json({ error: "Error al agregar waifu" });
    }
  });
  

// ✅ Actualizar waifu (CORREGIDO)
app.put("/waifus/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, codename, persona, imagen } = req.body;

  try {
    const updatedWaifu = await db("waifus")
      .where({ id })
      .update({ nombre, codename, persona, imagen })
      .returning("*");

    if (updatedWaifu.length === 0) {
      return res.status(404).json({ error: "Waifu no encontrada" });
    }

    res.json(updatedWaifu[0]);
  } catch (error) {
    console.error("Error al actualizar waifu:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// ✅ Eliminar waifu
app.delete("/waifus/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await db("waifus").where({ id }).del().returning("*");
  
      if (result.length === 0) {
        return res.status(404).json({ error: "Waifu no encontrada" });
      }
  
      res.json({ message: "Waifu eliminada", waifu: result[0] });
    } catch (error) {
      console.error("Error al eliminar waifu:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });
  

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Todo correcto funcionando y corriendo TE AMO HARU, Servidor corriendo en puerto ${PORT}`));
