const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const db = require('./src/db');

const username = 'sebas';
const password = '1234';
const expiresIn = '2h';

 // Asegúrate de que la ruta sea correcta

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

  const urlRoute = require("./src/url");
  const versionRoute = require("./src/version");

  app.use(cors())
  app.use(express.json());



  //router comunication
  app.use("/url", urlRoute);
  app.use("/version", versionRoute);

  // Inicia el servidor
  app.listen(1991, () => {
    console.log('Aplicación de ejemplo ejecutándose en http://localhost:1991');
  }); 
}