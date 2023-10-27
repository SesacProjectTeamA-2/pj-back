const express = require('express');
const router = express.Router();
const controller = require('../controller/Cuser');
const controller = require('../controller/Cprofile');

router.get('/users', controller.getUsers); // 모든 유저 조회

router.get('/login/naver', controller.getLoginNaver);
router.get('/login/naver/callback', controller.getLoginNaverRedirect);

router.get('/login/google', controller.getLoginGoogle); // 구글 로그인
router.get('/login/google/redirect', controller.getLoginGoogleRedirect); // 구글 로그인 처리
router.post('/register', controller.postRegister); // 회원가입

module.exports = router;
