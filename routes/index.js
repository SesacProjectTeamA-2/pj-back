const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const groupRouter = require('./group');
const boardRouter = require('./board');

// index 라우터에는 각각의 라우터에 대한 태그와 설명을 작성
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
 *   name: Board
 *   description: 게시글 관련 API
 */
router.use('/board', boardRouter); // 게시글

module.exports = router;
