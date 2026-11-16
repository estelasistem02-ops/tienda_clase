const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

if (!CORREO_ADMIN || !PASSWORD_ADMIN) {
  console.log("Uso: node admins.js correo clave");
  process.exit(1);
}

async function crearAdmin() {
  const cliente = new MongoClient("mongodb://localhost:27017");

  try {
    await cliente.connect();
    const db = cliente.db("tienda_clase");

    const existe = await db
      .collection("admins")
      .findOne({ correo: CORREO_ADMIN });

    if (existe) {
      console.log("Ese administrador ya existe.");
      return;
    }

    const hash = await bcrypt.hash(PASSWORD_ADMIN, 10);

    await db.collection("admins").insertOne({
      correo: CORREO_ADMIN,
      password: hash,
    });

    console.log("Administrador creado correctamente.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await cliente.close();
  }
}

crearAdmin();
