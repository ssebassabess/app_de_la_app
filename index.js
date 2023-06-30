const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');

const username = 'sebas';
const password = '1234';
const expiresIn = '2h';



const urlRoute = require("./src/url");
const versionRoute = require("./src/version");

app.use(cors())
app.use(express.json());



//router comunication
app.use("/url", urlRoute);
app.use("/version", versionRoute);


  
// Inicia el servidor
app.listen(3000, () => {
  console.log('Aplicación de ejemplo ejecutándose en http://localhost:3000');
}); 