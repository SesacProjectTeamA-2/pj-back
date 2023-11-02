const dotenv = require('dotenv');
dotenv.config({path: __dirname + '/.env'})

module.exports = {
  secretKey: process.env.JWT_SECRET_KEY, // JWT 시크릿키
  option: {
    algorithm: 'HS256', // 해싱 알고리즘
    expiresIn: '30m', // 토큰 유효 기간
    issuer: 'Motimates', // 발행자
  },
};
