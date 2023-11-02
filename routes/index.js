const express = require('express');
const router = express.Router();
const userRouter = require('./user');
const missionRouter = require('./mission');

/**
 * @swagger
 * tags:
 *   name: userRouter
 *   description: 유저 관련 라우터
 */
router.use('/user', userRouter);

/**
 * @swagger
 * tags:
 *   name: Mission
 *   description: 미션 관련 API
 */
router.use('/mission', missionRouter); // 미션

module.exports = router;
