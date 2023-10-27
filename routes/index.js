const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const groupRouter = require('./group');

router.use('/user', userRouter); // 유저
router.use('/group', groupRouter); // 모임

module.exports = router;
