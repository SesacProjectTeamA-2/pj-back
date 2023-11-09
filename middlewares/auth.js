const jwt = require('../modules/jwt');
// const MSG = require('../modules/responseMessage');
// const CODE = require('../modules/statusCode');
// const util = require('../modules/util');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const authUtil = {
  checkToken: async (req, res, next) => {
    console.log('====================================');
    console.log(req.headers);
    try {
      var token = req.headers.authorization.split(' ')[1];
      console.log(token);

      // 토큰 없음
      if (!token) return res.json({ error: '토큰 없음' });
      // decode
      const user = await jwt.verify(token);
      console.log('디코딩 된 토큰 :', user);
      console.log(' 토큰 :', token);
      // 유효기간 만료
      if (user === TOKEN_EXPIRED)
        return res.json({ error: '유효기간 만료된 토큰' });
      // 유효하지 않는 토큰
      if (user === TOKEN_INVALID)
        return res.json({ error: '유효하지 않는 토큰' });
      if (user.uSeq === undefined)
        return res.json({ error: '토근 : undefined' });
      req.uSeq = user.uSeq;
      next();
    } catch {
      return res.status(500).json({ error: '토큰 확인 중 서버 에러' });
    }
  },
};

module.exports = authUtil;
