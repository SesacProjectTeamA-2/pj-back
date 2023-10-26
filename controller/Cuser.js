const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config({ path: __dirname + '/../config/.env' });

// GET '/api/user/users'
// 모든 유저 조회
exports.getUsers = (req, res) => {
  res.send('ok');
};

// 네이버 url로 연결.
exports.getLoginNaver = () => {
  const NaverClientId = process.env.NAVER_CLIENT_ID;
  const RedirectUri = encodeURI(
    'http://localhost/8888/api/login/naver/callback'
  );
  const State = 'test';
  const NaverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NaverClientId}&redirect_uri=${RedirectUri}&state=${State}`;

  res.redirect(NaverAuthUrl);
};

// 로그인하여 정보처리 동의시, redirectUri 로 code 발급.
exports.getLoginNaverRedirect = async () => {
  const NaverClientId = process.env.NAVER_CLIENT_ID;
  NaverClientIdSecret = process.env.NAVER_CLIENT_SECRET;

  // 발급된 code 변수할당.
  // code 값은 토큰 발급 요청에 사용됨.
  let code = req.query.code;
  let callbackState = req.query.state;

  // 토큰발급 요청 url
  let api_url =
    'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=' +
    NaverClientId +
    '&client_secret=' +
    NaverClientIdSecret +
    '&code=' +
    code +
    '&state=' +
    callbackState;

  // 토큰 발급 요청
  axios({
    method: 'get',
    url: api_url,
    headers: {
      'X-Naver-Client-Id': NaverClientId,
      'X-Naver-Client-Secret': NaverClientIdSecret,
    },
  })
    .then((res) => {
      console.log('토큰정보', res.data);

      return axios({
        method: 'get',
        url: 'https://openapi.naver.com/v1/nid/me',
        // 프로필 api url
        headers: {
          Authorization: res.data.token_type + ' ' + res.data.access_token,
        },
      });
    })
    .then((res) => console.log(res.data));
};
