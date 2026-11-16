require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");


//brindamos el certificado de seguridad para que el navegador no bloquee la comunicación
app.use(
  cors({
    origin: "http://localhost:4200",
  }),
);

app.use(express.json());
const cliente = new MongoClient("mongodb://localhost:27017");

let db;

const JWT_SECRET = process.env.JWT_SECRET;

function validarUsuario(datos) {
  const nombre = typeof datos?.nombre === "string" ? datos.nombre.trim() : "";
  const correo = typeof datos?.correo === "string" ? datos.correo.trim() : "";

  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("El correo electrónico no es válido");
  }
  return { nombre, correo };
}

function validarProducto(datos) {
  const nombre = typeof datos?.nombre === "string" ? datos.nombre.trim() : "";
  const precio = datos?.precio;
  const existencia = datos?.existencia;

  if (!nombre) {
    throw new Error("La existencia debe ser un entero mayor a o igual a 0");
  }

  if (typeof precio !== "number" || !Number.isFinite(precio) || precio <= 0) {
    throw new Error("El precio del producto no es válido");
  }

  if (!Number.isInteger(existencia) || existencia < 0) {
    throw new Error("La existencia del producto no es válida");
  }
  return { nombre, precio, existencia };
}

function validarId(req, res, next) {
  const id = req.params.id;

  if (!/^[0-fA-F0-9]{24}$/.test(id)) {
    return res.status(400).json({
      mensaje: "ID inválido",
    });
  }
  req.mongoId = new ObjectId(id);
  next();
}

//verifica que la petición traiga un token válido
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Sesión inválida o expirada" });
  }
}

//en esta sección se va a trabajar el CRUD con MONGODB

function registrarCrud(nombreColeccion, validarDatos) {
  const ruta = `/api/${nombreColeccion}`;

  //obtener todos los documentos
  app.get(ruta, async (req, res, next) => {
    try {
      const registros = await db
        .collection(nombreColeccion)
        .find()
        .sort({ _id: -1 })
        .toArray();
      res.json(registros);
    } catch (error) {
      next(error);
    }
  });

  //insertar un documento nuevo, create
  app.post(ruta, async (req, res, next) => {
    let datos;

    try {
      datos = validarDatos(req.body);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }

    try {
      const resultado = await db.collection(nombreColeccion).insertOne(datos);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  });

  //update un documento por su ID
  app.put(`${ruta}/:id`, validarId, async (req, res, next) => {
    let datos;
    try {
      datos = validarDatos(req.body);
    } catch (error) {
      return res.status(400).json({ mensaje: error.message });
    }
    try {
      const resultado = await db
        .collection(nombreColeccion)
        .updateOne({ _id: req.mongoId }, { $set: datos });

      if (resultado.matchedCount === 0) {
        return res.status(404).json({ mensaje: "Documento no encontrado" });
      }
      res.json({ mensaje: "Documento actualizado" });
    } catch (error) {
      next(error);
    }
  });


//eliminar un documento por su ID
app.delete(`${ruta}/:id`, validarId, async (req, res, next) => {
    try {
    const resultado = await db
      .collection(nombreColeccion)
      .deleteOne({ _id: req.mongoId });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        mensaje: "Documento no encontrado",
      });
    }
    res.status(200).json({ mensaje: "Documento eliminado" });
  } catch (error) {
    next(error);
  }
});

}

app.post("/api/login", async (req, res, next) => {
  try{
    const correo = 
    typeof req.body?.correo === "string" ? req.body.correo.trim() : "";
    const password =
    typeof req.body?.password === "string" ? req.body.password : "";

    if (!correo || ! password){
      return res.status (400).json({mensaje: "Escribe tu correo y contraseña"});

}

const admin = await db.collection("admins").findOne({ correo });
const valido = admin && (await bcrypt.compare(password, admin.password));
    
    if (!valido) {
      return res.status(401).json({ mensaje: "correo o contraseña incorrectos" });

    }

const token = jwt.sign({ id: admin._id, correo: admin.correo},
  JWT_SECRET, {
    expiresIn: "2h",

  });

  res.json({ token });
} catch (error){
  next(error);

  }
});

//desde aquí, todo lo que empiece con /api requiere token
app.use("/api", verificarToken);

//registramos las rutas de las collections
registrarCrud("usuarios", validarUsuario);
registrarCrud("productos", validarProducto);

//manejo de errores
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ mensaje: "JSON inválido" });
  }

  res.status(500).json({ mensaje: "Error interno del servidor" });
});

//funcion para conectarnos a MONGODB

async function iniciar() {
  try {
    await cliente.connect();
    db = cliente.db("tienda_clase");
    app.listen(3000, "127.0.0.1", () => {
      console.log("API disponible en http://localhost:3000");
    });
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    await cliente.close();
    process.exit(1); // Salir del proceso con un código de error
  }
}
iniciar();
