const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');

router.get('/users', controller.getUsers); // 모든 유저 조회
router.get('/login/naver', controller.getLoginNaver);
router.get('/login/naver/callback', controller.getLoginNaverRedirect);

module.exports = router;
