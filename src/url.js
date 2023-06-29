const express = require('express');
const router = express.Router();
const db = require("./db")


router.get('/listar', (req, res) => {
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
router.get('/editar/:id', (req, res) => {
    const itemId = req.params.id;
    // Consulta el documento en la base de datos
    db.contenido.findOne({ _id: itemId }, (err, doc) => {
        if (err){
            console.error(err);
            res.status(500).json({ error: 'error al obtener los datos'});
        }else{
            //retorna el documento obtenido
            res.json(doc);
        }
    })
});

// Ruta para guardar los cambios de edición

router.post('/guardar/:id', (req, res) => {
    const intemId = req.params.id;
    const ipdateData = {
        nombre: req.body.url,
        url: req.body.url,
        url_encriptada: encriptarURL(req.body.url)    
    }

});


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



module.exports = router;