const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');
const authUtil = require('../middlewares/auth').checkToken;

/**
 * @swagger
 * paths:
 *   /api/group/main/{gSeq}:
 *     get:
 *       summary: 선택한 모임 메인화면
 *       description: 선택한 모임 메인 화면
 *       tags: [Group]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSeqParam'
 *       responses:
 *         "200":
 *           description: 해당 모임 시퀀스에 해당하는 모임 메인 화면 로드
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupMain'
 */
router.get('/main/:gSeq', controller.getGroupMain); // 모임 메인 화면

/**
 * @swagger
 * paths:
 *   /api/group:
 *     get:
 *       summary: 모임 조회 (검색어 검색 / 카테고리 검색)
 *       description: 모임 조회 (검색어 검색 / 카테고리 검색)
 *       tags: [Group]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSearchParam'
 *         - $ref: '#/components/parameters/groupCategoryParam'
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
 *   /api/group:
 *     post:
 *       summary: 모임 생성
 *       description: 모임 생성
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
 *   /api/group/:
 *     patch:
 *       summary: 모임 수정
 *       description: 모임 수정
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

/**
 * @swagger
 * paths:
 *   /api/group/:
 *     delete:
 *       summary: 모임 삭제
 *       description: 모임 삭제
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

module.exports = router;
