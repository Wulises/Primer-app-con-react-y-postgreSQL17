require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/img", express.static("img"));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Probar conexión a la BD
pool.connect()
  .then(() => console.log("Todo correcto funcionando y corriendo TE AMO HARU"))
  .catch(err => console.error("Error de conexión a PostgreSQL", err));

  //Ruta para obtener las wafius de la BD
// Ruta para obtener todos los productos
app.get("/productos", async (req, res) => {
    try {
      const resultado = await pool.query("SELECT * FROM productos");
      res.json(resultado.rows);
    } catch (error) {
      console.error("Error obteniendo productos", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

// Ruta para obtener todas las waifus
app.get("/waifus", async (req, res) => {
    try {
      const resultado = await pool.query("SELECT * FROM productos"); // ← CAMBIA A productos
      res.json(resultado.rows);
    } catch (error) {
      console.error("Error obteniendo waifus", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

app.put("/waifus/:id", async (req, res) => {
    const { id } = req.params;
    const { nombre, codename, persona } = req.body;
  
    try {
      const result = await pool.query(
        "UPDATE productos SET nombre = $1, codename = $2, persona = $3 WHERE id = $4 RETURNING *",
        [nombre, codename, persona, id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Waifu no encontrada" });
      }
  
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al actualizar waifu:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
  });

  
  

    
app.listen(5000, () => {
  console.log("Servidor corriendo en el puerto 5000");
});
