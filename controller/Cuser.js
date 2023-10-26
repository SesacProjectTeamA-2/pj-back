const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config/.env' });

// GET '/api/user/users'
// 모든 유저 조회
exports.getUsers = (req, res) => {
  res.send('ok');
};

// GET '/api/user/login/google'
// 구글 로그인
// 참고 자료 : https://velog.io/@mainfn/Node.js-express%EB%A1%9C-%EA%B5%AC%EA%B8%80-OAuth-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85%EB%A1%9C%EA%B7%B8%EC%9D%B8-%EA%B5%AC%ED%98%84
// 구글 로그인 버튼을 클릭하면 도착하는 라우터
// 모든 로직을 처리한 뒤, 구글 인증 서버인 https://accounts.google.com/o/oauth2/v2/auth으로 redirect됨
// → 이 url에 첨부할 몇 가지 QueryString이 필요
exports.getLoginGoogle = (req, res) => {
  let url = 'https://accounts.google.com/o/oauth2/v2/auth';
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
exports.getLoginGoogleRedirect = (req, res) => {
  const { code } = req.query;
  console.log(`code: ${code}`);
  
  // 1) 기존 회원인지, 비회원인지 확인
  
};