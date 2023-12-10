const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');
const authUtil = require('../middlewares/auth').checkToken;
const upload = require('../middlewares/imgUpload').upload;

/**
 * @swagger
 * paths:
 *   /api/group/detail/{gSeq}:
 *     get:
 *       summary: 선택한 모임 상세 화면
 *       security:
 *         - bearerAuth: []
 *       description: 선택한 모임 상세화면
 *       tags: [Group]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSeqParamPath'
 *       responses:
 *         "200":
 *           description: 해당 모임 시퀀스에 해당하는 모임 메인 화면 로드
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupDetail'
 */
router.get('/detail/:gSeq', controller.getGroupDetail); // 모임 상세 화면

/**
 * @swagger
 * paths:
 *   /api/group?search=search&category=category:
 *     get:
 *       summary: 모임 조회 (검색어 검색 / 카테고리 검색)
 *       description: 모임 조회 (검색어 검색 / 카테고리 검색)
 *       tags: [Group]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSearchParamQuery'
 *         - $ref: '#/components/parameters/groupCategoryParamQuery'
 *       responses:
 *         "200":
 *           description: 조건에 해당하는 모임 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupArray'
 */
router.get('/', controller.getGroups); // 모임 조회 (검색어 검색 / 카테고리 검색)

/**
 * @swagger
 * paths:
 *   /api/group/joined:
 *     get:
 *       summary: 내가 가입한 모임 리스트
 *       description: 내가 가입한 모임 리스트
 *       tags: [Group]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: 조건에 해당하는 모임 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupArray'
 */
router.get('/joined', authUtil, controller.getJoined); // 내가 가입한 모임 리스트

/**
 * @swagger
 * paths:
 *   /api/group/made:
 *     get:
 *       summary: 내가 생성한 모임 리스트
 *       description: 내가 생성한 모임 리스트
 *       tags: [Group]
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         "200":
 *           description: 조건에 해당하는 모임 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupArray'
 */
router.get('/made', authUtil, controller.getMade); // 내가 생성한 모임 리스트

/**
 * @swagger
 * paths:
 *   /api/group/quit/{gSeq}:
 *     delete:
 *       summary: 모임 탈퇴
 *       description: 모임 탈퇴
 *       tags: [Group]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *       requestBody:
 *         description: 모임 탈퇴 시, 모임장 위임이 필요한 경우 req.body
 *         required: false
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/changeGroupLeader'
 *       responses:
 *         "200":
 *           description: 조건에 해당하는 모임 탈퇴 요청 성공
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupArray'
 */
router.delete('/quit/:gSeq', authUtil, controller.deleteQuitGroup); // 모임 탈퇴

/**
 * @swagger
 * paths:
 *   /api/group:
 *     post:
 *       summary: 모임 생성
 *       description: 모임 생성
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       requestBody:
 *         description: 모임을 생성하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postGroup'
 *       responses:
 *         "200":
 *           description: 모임 생성에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.post('/', authUtil, controller.postGroup); // 모임 생성

/**
 * @swagger
 * paths:
 *   /api/group:
 *     patch:
 *       summary: 모임 수정
 *       description: 모임 수정
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       requestBody:
 *         description: 모임을 수정하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/patchGroup'
 *       responses:
 *         "200":
 *           description: 모임 수정에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.patch('/', authUtil, controller.patchGroup); // 모임 수정

// 모임 이미지 수정
router.patch(
  '/groupCoverImg',
  authUtil,
  upload.single('image'),
  controller.groupCoverImg
);

/**
 * @swagger
 * paths:
 *   /api/group:
 *     delete:
 *       summary: 모임 삭제
 *       description: 모임 삭제
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       requestBody:
 *         description: 모임을 삭제하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deleteGroup'
 *       responses:
 *         "200":
 *           description: 모임 삭제에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.delete('/', authUtil, controller.deleteGroup); // 모임 삭제

/**
 * @swagger
 * paths:
 *   /api/group/getJoinLink/{gSeq}:
 *     get:
 *       summary: 모임 초대 링크 가져오기
 *       description: 모임 초대 링크 가져오기
 *       tags: [Group]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *       responses:
 *         "200":
 *           description: 모임 초대 링크 가져오기
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupArray'
 */
router.get('/getJoinLink/:gSeq', controller.getJoinLink); // 모임 초대 링크 가져오기

/**
 * @swagger
 * paths:
 *   /api/group/joinByLink:
 *     post:
 *       summary: 링크로 모임 가입
 *       description: 링크로 모임 가입
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       requestBody:
 *         description: 링크로 모임 가입하기 위해 필요한 정보 (모임링크)
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postJoinByLink'
 *       responses:
 *         "200":
 *           description: 모임 가입에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.post('/joinByLink', authUtil, controller.postJoinByLink); // 링크로 모임 가입

/**
 * @swagger
 * paths:
 *   /api/group/join:
 *     post:
 *       summary: 모임 가입
 *       description: 모임 가입
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       requestBody:
 *         description: 모임 가입하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postJoin'
 *       responses:
 *         "200":
 *           description: 모임 가입에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.post('/join', authUtil, controller.postJoin); // 모임 가입

/**
 * @swagger
 * paths:
 *   /api/group/leader/{gSeq}:
 *     patch:
 *       summary: 모임장 위임
 *       description: 모임장 위임
 *       security:
 *         - bearerAuth: []
 *       tags: [Group]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *       requestBody:
 *         description: 새로운 모임장 uSeq
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/changeGroupLeader'
 *       responses:
 *         "200":
 *           description: 모임장 위임 성공 여부
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupApiResult'
 */
router.patch('/leader/:gSeq', authUtil, controller.patchLeader); // 모임장 위임

module.exports = router;
