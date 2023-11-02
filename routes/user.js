const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');
const authUtil = require('../middlewares/auth').checkToken;

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
 *      tags: [User]
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
 *   /api/user/:
 *     delete:
 *       summary: 유저 마이페이지
 *       description: 마이페이지 로드
 *       tags: [User]
 *       responses:
 *         "200":
 *           description: 로그인 상태인 경우에 마이페이지 출력
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/userMypageApiResult'
 */

router.get('/mypage', authUtil, controller.getProfile);

/**
 * @swagger
 * paths:
 *   /api/user:
 *     patch:
 *       summary: 마이페이지 수정
 *       description: 마이페이지 수정
 *       tags: [User]
 *       requestBody:
 *         description: 마이페이지 수정 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/editMypageAPIResult'
 *       responses:
 *         "200":
 *           description: 마이페이지 수정
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/editMypageAPIResult'
 */
router.patch('/mypage', controller.editProfile);

module.exports = router;
