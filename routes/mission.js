const express = require('express');
const router = express.Router();
const controller = require('../controller/Cmission');
const authUtil = require('../middlewares/auth').checkToken;

/**
 * @swagger
 * paths:
 *   /api/mission/user:
 *     get:
 *       summary: 유저 미션 조회
 *       description: 유저 미션 조회
 *       security:
 *         - bearerAuth: []
 *       tags: [Mission]
 *       responses:
 *         "200":
 *           description: 회원 미션 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/missionResult'
 */
// 유저 미션 조회
router.get('/user', authUtil, controller.getMission);

/**
 * @swagger
 * paths:
 *   /api/mission/group/{gSeq}:
 *     get:
 *       summary: 그룹 미션 조회
 *       description: 그룹 미션 조회
 *       security:
 *         - bearerAuth: []
 *       tags: [Mission]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSeqParamPath'
 *       responses:
 *         "200":
 *           description: 그룹 미션 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/groupMissionResult'
 */
// 그룹 미션 조회
router.get('/group/:gSeq', authUtil, controller.getGroupMission);

/**
 * @swagger
 * paths:
 *   /api/mission/{gSeq}:
 *     patch:
 *       summary: 미션 수정
 *       description: 미션 수정
 *       security:
 *         - bearerAuth: []
 *       tags: [Mission]
 *       parameters:
 *         - $ref: '#/components/parameters/groupSeqParamPath'
 *       requestBody:
 *         description: 미션 수정하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/editMission'
 *       responses:
 *         "200":
 *           description: 미션 수정에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/editMissionResult'
 */
router.patch('/:gSeq', authUtil, controller.editMission);

router.delete('/:gSeq', authUtil, controller.delMission);

module.exports = router;
