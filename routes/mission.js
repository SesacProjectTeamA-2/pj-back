const express = require('express');
const router = express.Router();
const controller = require('../controller/Cmission');

/**
 * @swagger
 * paths:
 *   /api/mission:
 *     get:
 *       summary: 미션 조회
 *       description: 미션 조회
 *       tags: [Mission]
 *
 *       responses:
 *         "200":
 *           description: 회원 미션 조회
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/missionResult'
 */
// 미션 조회
router.get('/', controller.getMission);
