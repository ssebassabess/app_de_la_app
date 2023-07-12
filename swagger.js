const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

// Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'APPAPP',
      version: '1.0.0',
      description: 'Documentación de la app de la app',
    },
    basePath: '/',
  },
  apis: [
    path.join(__dirname, 'src', '*.js'), // Ruta a tus archivos de rutas de Express en src/
    path.join(__dirname, 'index.js') // Ruta a tu archivo index.js
  ],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;