const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');
const authUtil = require('../middlewares/auth').checkToken;

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

/**
 * @swagger
 * paths:
 *  /api/user/register:
 *    post:
 *      summary: "사용자 회원가입 요청"
 *      description: "사용자 회원가입 요청"
 *      tags: [userRouter]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                uEmail:
 *                  type: string
 *                  description: "가입할 때 이메일 (UNIQUE)"
 *                uName:
 *                  type: string
 *                  description: "유저 닉네임"
 *                uImg:
 *                  type: string
 *                  description: "프로필 이미지 URL"
 *                uCharImg:
 *                  type: string
 *                  description: "캐릭터 이미지 URL"
 *                uDesc:
 *                  type: string
 *                  description: "자기소개"
 *                uCategory1:
 *                  type: string
 *                  description: "관심분야1"
 *                uCategory2:
 *                  type: string
 *                  description: "관심분야2"
 *                uCategory3:
 *                  type: string
 *                  description: "관심분야3"
 *      responses:
 *        "200":
 *          description: "회원가입 성공"
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  OK:
 *                    type: boolean
 *                    description: "요청 성공 여부"
 *                  user:
 *                    type: object
 *                    properties:
 *                      uSeq:
 *                        type: integer
 *                        description: "유저 시퀀스"
 *                      uEmail:
 *                        type: string
 *                        description: "가입할 때 이메일 (UNIQUE)"
 *                      uName:
 *                        type: string
 *                        description: "유저 닉네임"
 *                      uImg:
 *                        type: string
 *                        description: "프로필 이미지 URL"
 *                      uCharImg:
 *                        type: string
 *                        description: "캐릭터 이미지 URL"
 *                      uDesc:
 *                        type: string
 *                        description: "자기소개"
 *                      uCategory1:
 *                        type: string
 *                        description: "관심분야1"
 *                      uCategory2:
 *                        type: string
 *                        description: "관심분야2"
 *                      uCategory3:
 *                        type: string
 *                        description: "관심분야3"
 */

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
router.get('/mypage/:uSeq', authUtil, controller.getProfile);

module.exports = router;
