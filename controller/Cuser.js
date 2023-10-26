// GET '/api/user/users'
// 모든 유저 조회
exports.getUsers = (req, res) => {
  res.send('ok');
};

const axios = require('axios');

// env
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/config/.env' });

exports.getOAuth = (req, res) => {
  const REST_API_KEY = process.env.REST_API_KEY;
  const REDIRECT_URL = process.env.REDIRECT_URL;
  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URL}`;
  console.log(kakaoAuthURL);
  res.redirect(kakaoAuthURL);
  console.log(res.statusCode);
};

exports.getKakao = async (req, res) => {
  const { code } = req.query; // 카카오로부터 전달받은 인증 코드
  const REST_API_KEY = process.env.REST_API_KEY;
  const REDIRECT_URL = process.env.REDIRECT_URL;

  // 액세스 토큰 요청을 위한 데이터 생성
  const data = new URLSearchParams();
  data.append('grant_type', 'authorization_code');
  data.append('client_id', REST_API_KEY);
  data.append('redirect_uri', REDIRECT_URL);
  data.append('code', code);

  console.log(code);

  try {
    // 카카오 OAuth 서버로 POST 요청 보내기
    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // 응답 데이터에서 액세스 토큰 추출
    const { access_token } = response.data;

    const kakaoUser = await axios.get(`https://kapi.kakao.com/v2/user/me`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userEmail = kakaoUser.data.kakao_account.email;
    const userName = kakaoUser.data.properties.nickname;
    const userImg = kakaoUser.data.properties.profile_image;
    console.log(userEmail, userName, userImg);

    res.status(200).json({ userEmail, userName, userImg });
  } catch (error) {
    // 에러 처리
    console.error('액세스 토큰 요청 중 오류 발생:', error);
    res.status(500).json({ error: '액세스 토큰 요청 중 오류 발생' });
  }
};
