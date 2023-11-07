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

// 3) express-session : 세션 미사용
// app.use(
//   session({
//     secret: process.env.SESSION_KEY,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       httpOnly: true,
//       maxAge: 2 * 60 * 60 * 1000,
//     },
//   })
// );

// 4) swagger
// 첫 인자로 받은 경로로 접속하면 swagger UI가 보임
app.use(
  '/api-docs',
  eba({
    // swagger 로그인 설정
    challenge: true,
    users: { admin: process.env.SWAGGER_PW },
  }),
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// 5) socket.io
// socket.io 옵션
const options = {
  cors: {
    // 신뢰할 수 있는 사이트 등록
    origin: [
      `${process.env.SERVER_DEV_URL}:${process.env.FRONT_DEV_PORT}`, // 로컬
      `${process.env.SERVER_PROD_DOMAIN}:${process.env.FRONT_PROD_PORT}`, // 배포
    ],
    methods: ['GET', 'POST'],
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
});

// 그룹 채팅 라우트
// app.get('/api/group/chat/:chatRoomNumber', (req, res) => {
//   // 채팅방 번호를 가져오는 부분
//   const chatRoomNumber = req.params.chatRoomNumber;
//   res.sendFile(__dirname + '/index.html'); // 렌더링할 HTML 파일을 보내줄 수 있음
// });

// // Socket.IO 연결
// io.on('connection', (socket) => {
//   console.log('소켓 연결이 이루어졌습니다.');

//   socket.on('chat message', (msg) => {
//     io.emit('chat message', msg); // 모든 클라이언트에 메시지를 전송
//   });

//   socket.on('disconnect', () => {
//     console.log('소켓 연결이 끊어졌습니다.');
//   });
// });

/**
 * @path {GET} ${URL}:${PORT}/api
 * @description 모든 api는 indexRouter를 거쳐가도록 설정
 */
const indexRouter = require('./routes');
app.use('/api', indexRouter);

// 채팅
app.get('/api/group/chat', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 에러 처리
app.get('*', (req, res) => {
  res.send('error');
});

db.sequelize.sync({ force: false }).then(() => {
  server.listen(serverPort, () => {
    console.log(`${serverUrl}:${serverPort}`);
  });
});
