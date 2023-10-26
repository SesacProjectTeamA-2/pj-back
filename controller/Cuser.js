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
=======
// GET '/api/user/login/google'
// 구글 로그인
// 참고 자료 : https://velog.io/@mainfn/Node.js-express%EB%A1%9C-%EA%B5%AC%EA%B8%80-OAuth-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84
// 구글 로그인 버튼을 클릭하면 도착하는 라우터
// 모든 로직을 처리한 뒤, 구글 인증 서버인 https://accounts.google.com/o/oauth2/v2/auth으로 redirect됨
// → 이 url에 첨부할 몇 가지 QueryString이 필요
exports.getLoginGoogle = (req, res) => {
  let url = process.env.GOOGLE_OAUTH_ACCOUNT_URL;
  // OAuth API에서 발급받은 clinet_id 추가
  url += `?client_id=${process.env.GOOGLE_CLIENT_ID}`;
  // OAuth API에 등록한 redirect url
  url += `&redirect_uri=${process.env.GOOGLE_LOGIN_REDIRECT_URI}`;
  // 필수 옵션
  url += `&response_type=code`;
  // 구글에 등록된 유저의 email, profile, openid을 가져오겠다고 명시
  url += '&scope=email profile openid';
  res.redirect(url);
};

// GET '/api/user/login/google/redirect'
// 구글 로그인 처리
// 구글 계정 선택 화면에서 계정 선택 후, redirect 된 주소
// → OAuth API 등록시 입력한 승인된 리디렉션 URI 주소 입력
// 아까 등록한 GOOGLE_LOGIN_REDIRECT_URI 일치해야 함
exports.getLoginGoogleRedirect = async (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`);

  // access_token, refresh_token 등 구글 토큰 정보 가져오기
  try {
    const tokenInfo = await axios.post(process.env.GOOGLE_OAUTH_TOKEN_URL, {
      // x-www-form-urlencoded(body)
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_LOGIN_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    // 토큰 정보
    const { access_token, token_type } = tokenInfo.data;

    // 1) 구글 계정 정보 존재
    if (access_token) {
      // token_type: 'Bearer'
      // email, gmail, profile, openid 등의 사용자 구글 계정 정보 가져오기
      const userInfo = await axios.get(process.env.GOOGLE_USERINFO_URL, {
        // Request Header에 Authorization 추가
        headers: {
          Authorization: `${token_type} ${access_token}`, // 'Bearer ~~~'
        },
      });

      // 유저 정보
      const { email, verified_email, name, picture, locale } = userInfo.data;
      // 유저 정보 DB에 저장하기
      res.send('ok');
    } else {
      res.send({ isSuccess: false });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false });
  }

  // 1) 기존 회원인지, 비회원인지 확인
  // 회원이면 메인화면으로 이동
  // if (true) {
  //   const userInfo = {};
  //   res.send('회원', userInfo);
  //   // 비회원이면 회원가입화면으로 이동
  // } else {
  //   res.send('비회원');
  // }

};
