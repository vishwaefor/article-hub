const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    info: {
        title: 'Article Hub REST API',
        version: '1.0.0',
        description: 'CMS for Articles',
    }

};

const options = {
    swaggerDefinition,
    apis: ['./models/*.js','./routes/*.js'],
};

module.exports = swaggerJSDoc(options);