const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const config = require(__dirname + '/../../config/config.js')[
  process.env.NODE_ENV
];

// swagger-config.yaml파일로 설정하지 않은 이유는
// 보안을 위해 서버 URL과 PORT를 숨기기 위함
const { serverUrl, serverPort } = config;

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Motimates OpenAPI',
      description: 'Motimates RestFul API 클라이언트 UI',
      contact: {
        name: 'Motimates',
        email: 'eoeung113@gmail.com',
      },
    },
    servers: [
      {
        url: `${serverUrl}:${serverPort}`, // 요청 URL
      },
    ],
  },
  apis: ['./routes/*.js', './modules/swagger/**/*.yaml'], // swagger와 연동할 파일 작성
};

const specs = swaggerJSDoc(options);

module.exports = { swaggerUi, specs };
