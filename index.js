const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const username = 'sebas';
const password = '1234';
const expiresIn = '2h';

app.use(cors())
app.use(express.json());



// Genera una clave secreta única
const claveSecreta = crypto.randomBytes(32);


//router comunication

const url = require("./src/url");

app.use("/url", url);




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
app.post('/agregar', (req, res) => {
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
app.listen(80, () => {
  console.log('Aplicación de ejemplo ejecutándose en http://localhost:80');
}); 