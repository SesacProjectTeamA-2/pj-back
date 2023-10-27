const express = require('express');
const router = express.Router();
const userRouter = require('./user');

/**
 * @swagger
 * tags: 
 *   name: userRouter
 *   description: 유저 관련 라우터  
 */
router.use('/user', userRouter);

module.exports = router;