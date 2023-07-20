const express = require('express');
const router = express.Router();
const db = require("./db")
const moment = require('moment');
const { encriptarURL } = require('./cripto');

/**
 * @swagger
 * /url/listar:
 *   get:
 *     summary: Obtener URLs
 *     description: Obtiene todas las URLs registradas.
 *     responses:
 *       200:
 *         description: OK. Devuelve un array de URLs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     description: Nombre de la URL.
 *                   url:
 *                     type: string
 *                     description: URL original.
 *                   fecha:
 *                     type: string
 *                     description: Fecha de creación en formato "DD/MM/YYYY".
 *       500:
 *         description: Error al obtener los datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */
  router.get('/listar', (req, res) => {
    // Consulta todos los documentos de la base de datos
    db.url.find({}, { nombre: 1, url: 1, fecha: 1 }, (err, docs) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
      } else {
        // Retorna los datos obtenidos
        res.json(docs);
      }
    });
  });

/**
 * @swagger
 * /url/agregar:
 *   post:
 *     summary: Agregar nueva URL encriptada
 *     description: Agrega una nueva URL encriptada a la base de datos.
 *     parameters:
 *       - in: body
 *         name: nuevaURL
 *         description: Datos de la nueva URL.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *               description: Nombre de la URL.
 *             url:
 *               type: string
 *               description: URL original.
 *     responses:
 *       200:
 *         description: URL agregada correctamente. Devuelve el documento de la URL agregada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la URL.
 *                 url:
 *                   type: string
 *                   description: URL original.
 *                 url_encriptada:
 *                   type: string
 *                   description: URL encriptada.
 *                 fecha:
 *                   type: string
 *                   description: Fecha de creación en formato "DD/MM/YYYY".
 *       500:
 *         description: Error al agregar el nuevo dato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */
router.post('/agregar', (req, res) => {
  const nombre = req.body.nombre;
  const url = req.body.url;
  const urlEncriptada = encriptarURL(url);
  const fechaActual = moment().format('DD/MM/YYYY'); // Obtener fecha actual en formato "día/mes/año"

  const nuevoDato = {
    nombre: nombre,
    url: url,
    url_encriptada: urlEncriptada,
    fecha: fechaActual // Agregar la fecha actual formateada al nuevo dato
  };

  // Inserta el nuevo documento en la base de datos
  db.url.insert(nuevoDato, (err, newDoc) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al agregar el nuevo dato' });
    } else {
      res.json(newDoc);
    }
  });
});

/**
 * @swagger
 * /url/editar/{id}:
 *   get:
 *     summary: Mostrar vista de edición
 *     description: Muestra la vista de edición de una URL.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la URL a editar.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK. Devuelve el documento de la URL a editar.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nombre:
 *                   type: string
 *                   description: Nombre de la URL.
 *                 url:
 *                   type: string
 *                   description: URL original.
 *                 url_encriptada:
 *                   type: string
 *                   description: URL encriptada.
 *                 fecha:
 *                   type: string
 *                   description: Fecha de creación en formato "DD/MM/YYYY".
 *       500:
 *         description: Error al obtener los datos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */
router.get('/editar/:id', (req, res) => {
  const itemId = req.params.id;
  // Consulta el documento en la base de datos
  db.url.findOne({ _id: itemId }, (err, doc) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener los datos' });
    } else {
      // Retorna el documento obtenido
      res.json(doc);
    }
  });
});

/**
 * @swagger
 * /url/guardar/{id}:
 *   post:
 *     summary: Guardar cambios de edición
 *     description: Guarda los cambios de edición de una URL.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la URL a editar.
 *         required: true
 *         schema:
 *           type: string
 *       - in: body
 *         name: datosEdicion
 *         description: Datos de la edición.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: URL original.
 *     responses:
 *       200:
 *         description: Cambios guardados correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si los cambios se guardaron correctamente.
 *       500:
 *         description: Error al guardar los cambios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */
router.post('/guardar/:id', (req, res) => {
  const itemId = req.params.id;
  const updateData = {
    nombre: req.body.url,
    url: req.body.url,
    url_encriptada: encriptarURL(req.body.url),
    fecha: moment().format('DD/MM/YYYY')
  };

  // Actualiza el documento en la base de datos
  db.url.update({ _id: itemId }, { $set: updateData }, {}, (err, numReplaced) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al guardar los cambios' });
    } else {
      res.json({ success: true });
    }
  });
});

/**
 * @swagger
 * /url/eliminar/{id}:
 *   delete:
 *     summary: Eliminar URL
 *     description: Elimina una URL de la base de datos.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de la URL a eliminar.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL eliminada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indica si la URL se eliminó correctamente.
 *       500:
 *         description: Error al eliminar el dato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Mensaje de error.
 */
router.delete('/eliminar/:id', (req, res) => {
  const itemId = req.params.id;
  db.url.remove({ _id: itemId }, {}, (err, numRemoved) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al eliminar el dato' });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;