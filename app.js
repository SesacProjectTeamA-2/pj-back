const express = require('express');
const app = express();
const server = require('http').createServer(app);

// NODE.ENV가 지정되어 있지 않으면 development 모드로 실행
process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == 'production'
    ? 'production'
    : 'development';

// config
const config = require(__dirname + '/config/config.js')[process.env.NODE_ENV];
const { serverUrl, serverPort } = config; // 서버 설정

// env
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/config/.env' });

// 미리 설정한 sequelize 불러오기
const db = require('./models/index');

// 세션
const session = require('express-session');

// 리액트와 연결을 위한 cors
const cors = require('cors');

// swagger
const { swaggerUi, specs } = require('./modules/swagger/swagger');
const eba = require('express-basic-auth');

// 1) body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2) cors
app.use(cors());

// 3) swagger
// 첫 인자로 받은 경로로 접속하면 swagger UI가 보임
app.use(
  '/api-docs',
  // eba({
  //   // swagger 로그인 설정
  //   challenge: true,
  //   users: { admin: process.env.SWAGGER_PW },
  // }),
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// 4) socket.io
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile); // HTML을 뷰로 사용하기 위한 설정

// socket.io 옵션
const options = {
  cors: {
    // 신뢰할 수 있는 사이트 등록
    origin: [
      // 프론트
      `${process.env.SERVER_DEV_URL}:${process.env.FRONT_DEV_PORT}`, // 로컬
      `${process.env.SERVER_PROD_DOMAIN}:${process.env.FRONT_PROD_PORT}`, // 배포
      // 서버
      `${process.env.SERVER_DEV_URL}:${process.env.SERVER_DEV_PORT}`, // 로컬
      `${process.env.SERVER_PROD_DOMAIN}:${process.env.SERVER_PROD_PORT}`, // 배포
    ],
    methods: ['GET', 'POST'],
    // credentials : true
    // 쿠키, 인증헤더, TLS client certificates 를 일컫는다.
    // client 와 server 가 쿠키 값을 공유하겠다는 말
    // client server 모두 credentials 사용한다는 속성 설정해줘야 한다.
  },
};

// 정적 파일을 제공하기 위한 미들웨어 설정
app.use(express.static('public'));

// socket.io
const io = require('socket.io')(server, options);
// Socket.io와 Express 애플리케이션을 설정하고 사용합니다.
app.use((req, res, next) => {
  req.io = io; // req.io에 Socket.io 객체를 할당합니다.
  next();
  // next()가 있을때와 없을때의 차이점
});

/**
 * @path {GET} ${URL}:${PORT}/api
 * @description 모든 api는 indexRouter를 거쳐가도록 설정
 */
const indexRouter = require('./routes');
app.use('/api', indexRouter);

// 에러 처리
app.get('*', (req, res) => {
  res.send('error');
});

db.sequelize.sync({ force: false }).then(() => {
  server.listen(serverPort, () => {
    console.log(`${serverUrl}:${serverPort}`);
  });
});
