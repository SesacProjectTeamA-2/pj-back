const express = require('express');
const app = express();

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

// 미들웨어 등록
// 1) body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 2) cors
app.use(cors());
// 3) express-session
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    },
  })
);
// 4) swagger
// 첫 인자로 받은 경로로 접속하면 swagger UI가 보임
app.use(
  '/api-docs',
  eba({ // swagger 로그인 설정
    challenge: true,
    users: { admin: process.env.SWAGGER_PW },
  }),
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

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
  app.listen(serverPort, () => {
    console.log(`${serverUrl}:${serverPort}`);
  });
});
