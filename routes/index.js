const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const groupRouter = require('./group');

router.use('/user', userRouter); // 유저
/**
 * @swagger
 * tags: Group
 *   name: postGroup
 *   description: 모임 생성
 */
router.use('/group', groupRouter); // 모임

module.exports = router;
