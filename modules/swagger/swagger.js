const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const config = require(__dirname + '/../../config/config.js')[
  process.env.NODE_ENV
];

const { serverUrl, serverPort } = config;

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Motimates',
      description: 'Motimates RestFul API 클라이언트 UI',
    },
    servers: [
      {
        url: `${serverUrl}:${serverPort}`, // 요청 URL
      },
    ],
  },
  apis: ['./routes/*.js'], // swagger와 연동할 파일 작성
};

const specs = swaggerJSDoc(options);

module.exports = { swaggerUI, specs };
