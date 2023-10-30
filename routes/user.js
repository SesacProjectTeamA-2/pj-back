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
 *  /api/user/mypage/:uSeq:
 *    get:
 *      summary: "프로필 수정 목록 조회"
 *      description: "서버에 데이터를 보내지 않고 Get방식으로 요청"
 *      tags: [User]
 *      responses:
 *        "200":
 *          description: "회원 정보 수정 페이지 load, 서버로 전달해주는 값은 uSeq 입니다."
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   ok:
 *                      type: boolean
 *                   user:
 *                    type: object
 *                    properties:
 *                      nickname:
 *                        type: string
 *                        description: "유저 닉네임"
 *                      userImg:
 *                        type: string
 *                        description: "프로필 이미지 URL"
 *                      character:
 *                        type: string
 *                        description: "캐릭터 이미지 URL"
 *                      coverImg:
 *                        type: string
 *                        description: "메인화면커버 이미지 URL"
 *                      coverLetter:
 *                        type: string
 *                        description: "자기소개"
 *                      phrase:
 *                        type: string
 *                        description: "내가 적은 명언"
 *                      category1:
 *                        type: string
 *                        description: "관심분야1"
 *                      category2:
 *                        type: string
 *                        description: "관심분야2"
 *                      category3:
 *                        type: string
 *                        description: "관심분야3"
 *                      setDday:
 *                        type: string
 *                        description: "대표 디데이 설정 여부"
 *                      mainDday:
 *                        type: integer
 *                        description: "대표모임디데이"
 *                      setMainGroup:
 *                        type: integer
 *                        description: "대표모임달성률"
 */
router.get('/mypage/:uSeq', authUtil, controller.getProfile);

/**
 * @swagger
 * paths:
 *  /api/user/mypage/uSeq:
 *    patch:
 *      summary: "프로필 수정"
 *      description: "닉네임, 자기소개, 명언, 카테고리 (1, 2, 3), 대표디데이설정, 설정그룹값, 달성률 그룹값 body로 받아옴."
 *      tags: [User]
 *      requestBody:
 *          required: true
 *          description: "서버로 전달해주는 값은 {uName, uDesc, uCategory(1,2,3), uSetDay, uMainGroup, uMainDday} 입니다."
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    user:
 *                      type: object
 *                    properties:
 *                      uName:
 *                        type: string
 *                        description: "유저 닉네임"
 *                      uDesc:
 *                        type: string
 *                        description: "자기소개"
 *                      uPhrase:
 *                        type: string
 *                        description: "내가 적은 명언"
 *                      uCategory1:
 *                        type: string
 *                        description: "관심분야1"
 *                      uCategory2:
 *                        type: string
 *                        description: "관심분야2"
 *                      uCategory3:
 *                        type: string
 *                        description: "관심분야3"
 *                      uSetDday:
 *                        type: string
 *                        description: "대표 디데이 설정 여부"
 *                      uMainDday:
 *                        type: integer
 *                        description: "대표모임디데이"
 *                      uMainGroup:
 *                        type: integer
 *                        description: "대표모임달성률"                        
 *      responses:
 *        "200":
 *          description: "닉네임 중복 체크를 하면서 성공여부를 true/false 형태로 응답합니다."
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                    ok:
 *                      type: boolean
 *                    user:
 *                      type: object
 *                      result:
 *                        type: boolean
 *                        description: "정보수정 성공 여부"
 *                      message:
 *                        type: string
 *                        description: "성공시: 정보 수정완료, 실패시: 닉네임이 중복됩니다"
 */
router.patch('/mypage/:uSeq', controller.editProfile);

module.exports = router;
