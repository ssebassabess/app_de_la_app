const express = require('express');
const router = express.Router();

const moment = require('moment');

router.get('/listar', (req, res) => {
    // Consulta todos los documentos de la base de datos
    db.version.find({}, (err, docs) => {
        if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los datos' });
        } else {
        // Retorna los datos obtenidos
        res.json(docs);
        }
    });
});

// Ruta para agregar una nueva URL encriptada
router.post('/agregar', (req, res) => {
    const nombre = req.body.nombre  
    const url = req.body.url;
    const urlEncriptada = encriptarURL(url);
    const fechaActual = moment().format('YYYY-MM-DD');
    const nuevoDato = {
        nombre: nombre,
        url: url,
        url_encriptada: urlEncriptada,
        fecha: fechaActual
    };

    // Inserta el nuevo documento en la base de datos
    db.version.insert(nuevoDato, (err, newDoc) => {
    if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al agregar el nuevo dato' });
    } else {
        res.json(newDoc);
    }
    });
});

// Ruta para mostrar la vista de edición
router.get('/editar/:id', (req, res) => {
    const itemId = req.params.id;
    // Consulta el documento en la base de datos
    db.version.findOne({ _id: itemId }, (err, doc) => {
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
    const itemId = req.params.id;
    const updateData = {
        nombre: req.body.url,
        url: req.body.url,
        url_encriptada: encriptarURL(req.body.url),
        fecha: moment().format('DD/MM/YYYY')    
    }

    // Actualiza el documento en la base de datos
    db.version.update({ _id: itemId }, { $set: updateData }, {}, (err, numReplaced) => {
    if (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al gaurdar los cambios'});
    }else {
        res.json({ succes: true});
    }   
    });
});

router.delete('/eliminar/:id', (req, res) => {
    const itemId = req.params.id;
    db.version.remove({ _id: itemId }, {}, (err, numRemoved) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al eliminar el dato' });
        } else {
            res.json({ success: true });
        }
    });
});



module.exports = router;