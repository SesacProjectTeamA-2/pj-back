# <img src="./public/logo.svg" width="35px" alt="[Logo]"> **Motimates Back-end**

<br/>

# 🧑‍🤝‍🧑 **Team Crew** - BE


|이름|역할|
|---|---|
| [문영민](https://github.com/eoeung) | 개발 환경 설정, Swagger 적용 및 파일 분리 |
| [문효진](https://github.com/jinnymoon1124) | JWT 미들웨어, 게시글 API 개발 |
| [최태영](https://github.com/chitty12) | 유저, 미션, 모임 API 개발 |

<br>

# 📂 **다운로드**

```bash
# 백엔드 소스 다운로드
$ git clone https://github.com/SesacProjectTeamA-2/pj-back.git
```

\+ 화면에서 실행하고 싶은 경우, 진행

```bash
# 프론트엔드 소스 다운로드
$ git clone https://github.com/SesacProjectTeamA-2/pj-front.git
```

<br/>

# 🛠️ **사용한 기술**

[![Node][Node.js]][Node-url] <br>
[![Express][Express]][Express-url] <br>
[![Sequelize][Sequelize]][Sequelize-url] <br>
[![MySQL][MySQL]][MySQL-url] <br>
[![Swagger][Swagger]][Swagger-url] <br>

<br>

# 📚 **주요 라이브러리**

- cors
- cross-env
- express-basic-auth
- jsonwebtoken
- node-cron

<br>

# 🚀 **ERD**

![image](https://github.com/SesacProjectTeamA-2/pj-front/assets/86273626/887bcebc-2966-4f5e-a2fa-a0033377fe8c)

<br>

# ⚙️ **개발 환경 설정**

## 1. .env 파일 설정

- config 폴더 밑에 **.env**파일을 생성

```bash
# .env 파일 생성
$ cd pj-back
$ touch .env
```

## 2. Swagger 설정

JWT를 사용해서 Bearer 토큰값이 필요한 경우, 설정해주는 부분

```javascript
// config/swagger.js
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
},
```

<br>

Swagger 로그인 설정(아이디, 비밀번호 입력)

```javascript
app.use(
  '/api-docs', // YOUR_URL/api-docs : Swagger 호출
  eba({ // const eba = require('express-basic-auth');
    // swagger 로그인 설정
    challenge: true,
    users: { YOUR_SWAGGER_ID: 'YOUR_SWAGGER_PW' }, // ID: PW
  }),
  swaggerUi.serve,
  swaggerUi.setup(specs)
);
```

## 3. 기타 API Key 값 설정
### 1) 소셜 로그인
- 구글 로그인
- 카카오 로그인
- 네이버 로그인
### 2) AWS S3

### [★★ .env 파일 샘플 코드 바로가기 !!! ★★](./config/sample.env)

<br>

# 🏃‍♂️ **서버 구동**

```bash
# git clone 이후에 실행
$ cd pj-back

# 개발 서버 (localhost:YOUR_PORT)
$ npm start

# 배포 서버 (YOUR_DOMAIN:YOUR_PORT)
$ npm run start:prod
```

<br>

# 📂 **프로젝트 폴더 구조:**

```JS

├── app.js
├── config
│   ├── .env
│   ├── config.js
│   ├── sample.env
│   └── secretkey.js
│
├── controller
│   ├── Cboard.js
│   ├── Ccomment.js
│   ├── Cgroup.js
│   ├── Cmission.js
│   └── Cuser.js
│
├── middlewares
│   ├── auth.js
│   └── imgUpload.js
│
├── models
│   ├── Group.js
│   ├── GroupBoard.js
│   ├── GroupBoardComment.js
│   ├── GroupBoardIcon.js
│   ├── GroupUser.js
│   ├── index.js
│   ├── User.js
│   └── Mission.js
│
├── modules
│   ├── swagger
│   │    ├── parameter
│   │    │    ├─ path
│   │    │    │  ├─ BoardParamPath.yaml
│   │    │    │  └─ GroupParamPath.yaml
│   │    │    │
│   │    │    ├─ query
│   │    │    │  ├─ BoardParamQuery.yaml
│   │    │    │  ├─ GroupParamQuery.yaml
│   │    │    │  └─ userParameter.yaml
│   │    │    └─ GroupParameter.yaml
│   │    │
│   │    ├── requestBody
│   │    │    ├─ BoardRequestBody.yaml
│   │    │    ├─ CommentRequestBody.yaml
│   │    │    ├─ GroupRequestBody.yaml
│   │    │    ├─ MissionRequestBody.yaml
│   │    │    └─ UserRequestBody.yaml
│   │    │
│   │    ├── response
│   │    │    ├─ BoardRequest.yaml
│   │    │    ├─ CommentResponse.yaml
│   │    │    ├─ GroupResponse.yaml
│   │    │    ├─ missionResponse.yaml
│   │    │    └─ UseResponse.yaml
│   │    │
│   │    └── swagger.js
│   │
│   ├── jwt.js
│   └── rankSystem.js
│
└── routes
    ├── board.js
    ├── comment.js
    ├── group.js
    ├── index.js
    ├── mission.js
    └── user.js
   // node-modules

```

<br/>

<!-- 이모지 검색 사이트 -->
<!-- https://tools.picsart.com/text/emojis/ -->

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[Node.js]: https://img.shields.io/badge/node.js-3c873a?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express]: https://img.shields.io/badge/Express-ffffff?style=for-the-badge&logo=Express&logoColor=000000
[Express-url]: https://expressjs.com/
[Sequelize]: https://img.shields.io/badge/Sequelize-000000?style=for-the-badge&logo=Sequelize&logoColor=52b0e7
[Sequelize-url]: https://sequelize.org/
[MySQL]: https://img.shields.io/badge/MySQL-5d87a2?style=for-the-badge&logo=MySQL&logoColor=f49823
[MySQL-url]: https://www.mysql.com/
[Swagger]: https://img.shields.io/badge/Swagger-85ea2d?style=for-the-badge&logo=Swagger&logoColor=173647
[Swagger-url]: https://swagger.io/
