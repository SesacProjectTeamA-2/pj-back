const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');

/**
 * @swagger
 * paths:
 *  /api/user/users:
 *    get:
 *      summary: "유저 데이터 전체조회"
 *      description: "서버에 데이터를 보내지 않고 Get방식으로 요청"
 *      tags: [userRouter]
 *      responses:
 *        "200":
 *          description: 전체 유저 정보
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          [
 *                            { "id": 1, "name": "유저1" },
 *                            { "id": 2, "name": "유저2" },
 *                            { "id": 3, "name": "유저3" },
 *                          ]
 */
router.get('/users', controller.getUsers); // 모든 유저 조회

router.get('/login/kakao/authorize', controller.getOAuth);
router.get('/login/kakao/token', controller.getKakao);

router.get('/login/naver', controller.getLoginNaver);
router.get('/login/naver/callback', controller.getLoginNaverRedirect);

router.get('/login/google', controller.getLoginGoogle); // 구글 로그인
router.get('/login/google/redirect', controller.getLoginGoogleRedirect); // 구글 로그인 처리
router.post('/register', controller.postRegister); // 회원가입


/**
 * @swagger
 * paths:
 *  /api/user/mypage/:uSeq:
 *    get:
 *      summary: "프로필 수정 목록 조회"
 *      description: "서버에 데이터를 보내지 않고 Get방식으로 요청"
 *      tags: [userRouter]
 *      responses:
 *        "200":
 *          description: 회원 정보 수정 페이지 load, 서버로 전달해주는 값은 uSeq 입니다.
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    users:
 *                      type: object
 *                      example:
 *                          [
{    "nickname": "chitty",
    "userImg": "../userimg",
    "character": "./characterImg",
    "coverImg": "././coverImg",
    "coverLetter": "안녕하세요 반갑습니다",
    "phrase": "내가 적은 명언",
    "category1": "운동",
    "category2": null,
    "category3": null,
    "setDday": "y",
    "mainDday": 1,
    "setMainGroup": 1}
 *                          ]
 */
router.get('/mypage/:uSeq', controller.getProfile);

module.exports = router;
