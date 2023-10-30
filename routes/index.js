const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const groupRouter = require('./group');

/**
 * @swagger
 * tags: 
 *   name: User
 *   description: 유저 관련 라우터  
 */
router.use('/user', userRouter); // 유저
/**
 * @swagger
 * tags:
 *   name: Group
 *   description: 모임 관련 API
 */
router.use('/group', groupRouter); // 모임

module.exports = router;
