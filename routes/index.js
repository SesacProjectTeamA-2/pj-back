const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const groupRouter = require('./group');
const boardRouter = require('./board');

/**
 * @swagger
 * tags: 
 *   name: User
 *   description: 유저 관련 API
 */
router.use('/user', userRouter); // 유저
/**
 * @swagger
 * tags:
 *   name: Group
 *   description: 모임 관련 API
 */
router.use('/group', groupRouter); // 모임

/**
 * @swagger
 * tags:
 *   name: groupRouter
 *   description: 게시글 관련 라우터
 */
router.use('/board', boardRouter); // 게시글

module.exports = router;
