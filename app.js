const express = require('express');
const app = express();

// NODE.ENV가 지정되어 있지 않으면 development 모드로 실행
process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == 'production'
    ? 'production'
    : 'development';

// env
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/config/.env' });

// 서버 설정
const PORT = process.env.PORT;

// 미리 설정한 sequelize 불러오기
const db = require('./models/index');

// 세션
const session = require('express-session');

// 리액트와 연결을 위한 cors
const cors = require('cors');

// 미들웨어 등록
// 1) body-parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

// 라우터
// 게시글
const userRouter = require('./routes/user');
app.use('/api/user', userRouter);

// 에러 처리
app.get('*', (req, res) => {
  res.send('error');
});

db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
