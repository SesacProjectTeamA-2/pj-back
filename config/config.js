const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const config = {
  development: {
    // DB 설정
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_DEV_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'Asia/Seoul', // DB에 저장할 때 시간 설정
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
      timezone: 'Asia/Seoul', // DB에 저장할 때 시간 설정
    },
    // 서버 설정
    serverUrl: process.env.SERVER_DEV_URL,
    serverPort: process.env.SERVER_DEV_PORT,
    //로그인 연동 설정
    naverClientId: process.env.NAVER_CLIENT_ID,
    naverClientSecret: process.env.NAVER_CLIENT_SECRET,
    // 프론트 설정
    frontPort: process.env.FRONT_DEV_PORT,
  },
  production: {
    // DB 설정
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_PROD_HOST,
    dialect: process.env.DB_DIALECT,
    timezone: 'Asia/Seoul', // DB에 저장할 때 시간 설정
    // 서버 설정
    serverUrl: process.env.SERVER_PROD_DOMAIN,
    serverPort: process.env.SERVER_PROD_PORT,
    //로그인 연동 설정
    naverClientId: process.env.NAVER_CLIENT_ID_PROD,
    naverClientSecret: process.env.NAVER_CLIENT_SECRET_PROD,
    // 프론트 설정
    frontPort: process.env.FRONT_PROD_PORT,
  },
};

module.exports = config;
