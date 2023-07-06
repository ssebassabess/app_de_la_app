const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const db = require('./src/db');
const urlRoute = require("./src/url");
const versionRoute = require("./src/version");

const username = 'sebas';
const password = '1234';
const expiresIn = '1h';
const defaultSecretKey = 'R4pW8sZ2x!%YqC@9'; 

// Código adicional de configuración, si lo tienes

db.url.loadDatabase((err) => {
  if (err) {
    console.error('Error al cargar la base de datos:', err);
    process.exit(1);
  } else {
    console.log('Base de datos cargada correctamente');
    startServer();
  }
});

function startServer() {
  app.use(cors());
  app.use(express.json());

  // Middleware de autenticación
  function authMiddleware(req, res, next) {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ error: 'Acceso no autorizado' });
    }
  
    try {
      // Verificamos la validez del token
      const decoded = jwt.verify(token, defaultSecretKey, { ignoreExpiration: false });
  
      if (decoded.exp <= Date.now() / 1000) { // Convertir segundos a milisegundos
        return res.status(401).json({ error: 'Token expirado' });
      }
  
      req.user = decoded;
  
      // Continuamos con el flujo normal de la solicitud
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  }

  // Endpoint para el inicio de sesión
  app.post('/login', (req, res) => {
    const { username: reqUsername, password: reqPassword } = req.body;

    if (reqUsername === username && reqPassword === password) {
      // Generar el token con fecha de expiración
      const token = jwt.sign({ username }, defaultSecretKey, { expiresIn });

      // Enviamos el token al cliente
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  });

  //router communication
  app.use("/url", authMiddleware, urlRoute);
  app.use("/version",authMiddleware, versionRoute);

  // Inicia el servidor
  app.listen(1991, () => {
    console.log('Aplicación de ejemplo ejecutándose en http://localhost:1991');
  });
}