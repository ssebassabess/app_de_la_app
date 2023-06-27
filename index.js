const express = require('express');
const crypto = require('crypto');
const Datastore = require('nedb');
const jwt = require('jsonwebtoken');
const app = express();

const username = 'sebas';
const password = '1234';
const expiresIn = '2h';

app.use(express.json());

// Configuración de la base de datos
const db = {};
db.contenido = new Datastore({ filename: './db/contenido.db', autoload: true });

// Genera una clave secreta única
const claveSecreta = crypto.randomBytes(32);

// Función para encriptar una URL con AES
function encriptarURL(url) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', claveSecreta, iv);
  const encrypted = cipher.update(url, 'utf8', 'hex') + cipher.final('hex');
  return iv.toString('hex') + encrypted;
}

// Función para desencriptar una URL encriptada con AES
function desencriptarURL(urlEncriptada) {
  const iv = Buffer.from(urlEncriptada.slice(0, 32), 'hex');
  const encrypted = urlEncriptada.slice(32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', claveSecreta, iv);
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  return decrypted;
}


// Middleware de autenticación
function authMiddleware(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    // Verificamos la validez del token
    const decoded = jwt.verify(token, 'clave-secreta', { ignoreExpiration: false });

    if (decoded.exp <= Date.now()) {
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
    const token = jwt.sign({ username }, 'clave-secreta', { expiresIn });

    // Enviamos el token al cliente
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});




// Ruta para agregar una nueva URL encriptada
app.post('/agregar',authMiddleware, (req, res) => {
  const nombre = req.body.nombre  
  const url = req.body.url;
  const urlEncriptada = encriptarURL(url);
  

  const nuevoDato = {
    nombre: nombre,
    url: url,
    url_encriptada: urlEncriptada
  };

  // Inserta el nuevo documento en la base de datos
  db.contenido.insert(nuevoDato, (err, newDoc) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al agregar el nuevo dato' });
    } else {
      res.json(newDoc);
    }
  });
});

// Ruta para obtener una URL original a partir de su ID
app.get('/url/:id',(req, res) => {
    const id = req.params.id;
  
    // Consulta el documento en la base de datos utilizando el ID
    db.contenido.findOne({ _id: id }, (err, doc) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
      } else {
        if (doc) {
          // Desencripta la URL encriptada
          const urlOriginal = desencriptarURL(doc.url_encriptada);
          if (urlOriginal) {
            res.json({ url_original: urlOriginal });
          } else {
            res.status(400).json({ error: 'URL inválida' });
          }
        } else {
          res.status(400).json({ error: 'ID inválido' });
        }
      }
    });
  });

// Ruta principal
app.get('/listar', (req, res) => {
    // Consulta todos los documentos de la base de datos
    db.contenido.find({}, (err, docs) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
      } else {
        // Retorna los datos obtenidos
        res.json(docs);
      }
    });
  });

  // Ruta para mostrar la vista de edición
app.get('/editar/:id', (req, res) => {
    const itemId = req.params.id;
  
    // Consulta el documento en la base de datos
    db.contenido.findOne({ _id: itemId }, (err, doc) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
      } else {
        // Retorna el documento obtenido
        res.json(doc);
      }
    });
  });
// Ruta para guardar los cambios de edición
app.post('/guardar-edicion/:id', (req, res) => {
    const itemId = req.params.id;
    const updatedData = {
      nombre: req.body.nombre,
      url: req.body.url,
      url_encriptada: encriptarURL(req.body.url)
    };
    
    // Actualiza el documento en la base de datos
    db.contenido.update({ _id: itemId }, { $set: updatedData }, {}, (err, numReplaced) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al guardar los cambios' });
      } else {
        res.json({ success: true });
      }
    });
});

// ruta para enviar solo los campos encriptados
app.get('/urls', (req, res) => {
  // Consulta todos los documentos de la base de datos
  db.contenido.find({}, { nombre: 1, url_encriptada: 1 }, (err, docs) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      // Retorna solo los nombres y las URL encriptadas
      res.json(docs);
    }
  });
});

  
// Inicia el servidor
app.listen(3000, () => {
  console.log('Aplicación de ejemplo ejecutándose en http://localhost:3000');
}); 