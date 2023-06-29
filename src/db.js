const Datastore = require('nedb');

// Configuración de la base de datos
const db = {};
db.contenido = new Datastore({ filename: './db/contenido.db', autoload: true });

module.exports = db;