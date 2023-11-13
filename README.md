# <img src="./public/logo.svg" width="35px" alt="[Logo]"> **Motimates Back-end**

<br/>

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

(https://www.erdcloud.com/d/koATx2ojGQyH5Y62S)
![image](https://github.com/SesacProjectTeamA-2/pj-front/assets/107044870/6fa7adb1-718f-4fdb-a493-1c623120f543)


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
  eba({
    // swagger 로그인 설정
    challenge: true,
    users: { YOUR_SWAGGER_ID: 'YOUR_SWAGGER_PW' }, // ID: PW
  }),
  swaggerUi.serve,
  swaggerUi.setup(specs)
);
```

### [!!! .env 파일 샘플 코드 바로가기 !!!](./config/sample.env)

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

# 🏃‍♂️ **서버 구동**

First of all let's make changes in `server.js`. There will find a part of code where a const array created name `allowedOrigins`.

```JS
// cross origin issue
const allowedOrigins = ["http://example1.com", "http://example2.com", "http://localhost:3000", "https://next-base-template.vercel.app"]

app.use(
  cors({
    origin: allowedOrigins,
  })
)
```

Whatever url client we will have for our project we have to add here in this array `allowedOrigins`.
For example: Our client site link is: _https://musiur.vercle.app_. So we will have new item in the array.

```
// cross origin issue
const allowedOrigins = ["http://example1.com", "http://example2.com", "http://localhost:3000", "https://next-base-template.vercel.app", "https://musiur.vercel.app"]
```

Then, we need to make changes in files in the `configs` folder in root directory of out project.
We have two javascript files inside our `configs` folder

- database.config.js
- server.config.js

Inside our `database.config.js` file by default we have set this code:

```JS
const DatabaseConfig = {
    uri:`MONGODB_DATABASE_URI`,
}

module.exports = DatabaseConfig
```

Now, we have to copy our `mongodb-uri` from mongodb connect and paste the copied `uri` into `DatabaseConfig` objects key `uri`. Also we have to create table `user` inside our database that is mentioned in that copied `uri` in **MONGODB** web or desktop application.

Let's make change to another file `server.config.js` where we have by default this code:

```JS
const ServerConfig = {
  port: 8080,
  secret: "Allahuakbar",
}

module.exports = ServerConfig
```

We may have whatever `port` we want and also the `secret` for `encrypting` and `decrypting` JWT for authentication.

Again, we have to make change in another folder `middlewares`. Here in this folder we have `mail.middlewares.js`. Inside this file we have:

```JS
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "YOUR EMAIL",
      pass: "YOUR PASS",
    },
  })

  const mailOptions = {
    from: "musiur.dev@gmail.com",
    to: toSend,
    subject,
    text: `Click to the click to verify your account: ${link}`,
  }

```

We need to make changes with our own credentials of nodemailer here:

```JS
auth: {
      user: "YOUR EMAIL",
      pass: "YOUR PASS",
    },
```

And also we need make changes here in this part:

```JS
const mailOptions = {
    from: "musiur.dev@gmail.com",
    to: toSend,
    subject,
    text: `Click to the click to verify your account: ${link}`,
  }

```

In `mailOptions` object we are going to deal with keys - _from and text_.

Now, we are ready to install all the packages.

Use your favorite package manager to install all of them.

Here I would prefer to have `pnpm` or, `yarn`:

```
pnpm install
```

or,

```
yarn install
```

After installing all the packages we are ready to visit our other folders to work with.

### 📂 **프로젝트 폴더 구조:**

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

<br/><br/>

### 🔑 **Account sign up:**

We have a route `/auth/signup` From client side/ application body we have to get these information in order to create an account.

```JS
{
  name: "Musiur Alam Opu",
  email: "musiur.opu@gmail.com",
  password: "musiur.opu@gmail.com",
  role: "user"
}
```

Here: this object should be found in `body` with `POST` method. Account will be created if there is no error and also a `verification email` will be sent to give email address above.

After verifing account in database the user account will be verified for rest of the time.

# To be continued...

## **Up next**

### 🔐 **Account sign in:**

### 🆕 **Reset password:**

### 💁 **Forget password:**

### 💬 **Other routes, controllers, schemas, models, middlewares explore:**

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
