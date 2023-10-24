const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');

router.get('/users', controller.getUsers); // 모든 유저 조회

module.exports = router;
