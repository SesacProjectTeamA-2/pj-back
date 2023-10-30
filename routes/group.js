const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');
const authUtil = require('../middlewares/auth').checkToken;

/**
 * @swagger
 * paths:
 *   /api/group:
 *     post:
 *       summary: 모임 생성
 *       description: POST 모임 생성
 *       tags: [Group]
 *       requestBody:
 *         description: 모임을 생성하기 위한 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postGroup'
 *         required: true
 *       responses:
 *         "200":
 *           description: 생성 완료된 모임 정보
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/postGroupResult'
 *
 */
router.post('/', authUtil, controller.postGroup); // 모임 생성

module.exports = router;