const jwt = require('../modules/jwt');
// const MSG = require('../modules/responseMessage');
// const CODE = require('../modules/statusCode');
// const util = require('../modules/util');
const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

const authUtil = {
  checkToken: async (req, res, next) => {
    console.log(req.headers);
    console.log('====================================');
    var token = req.headers.authorization.split(' ')[1];
    // 토큰 없음
    if (!token) return res.status(400).json({ error: '토큰 없음' });
    // decode
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰 :', user);
    // 유효기간 만료
    if (user === TOKEN_EXPIRED)
      return res.status(401).json({ error: '유효기간 만료된 토큰' });
    // 유효하지 않는 토큰
    if (user === TOKEN_INVALID)
      return res.status(402).json({ error: '유효하지 않는 토큰' });
    if (user.idx === undefined)
      return res.status(402).json({ error: '유효하지 않는 토큰' });
    req.idx = user.idx;
    next();
  },
};

module.exports = authUtil;