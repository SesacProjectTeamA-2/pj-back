const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');
const authUtil = require('../middlewares/auth').checkToken;

router.get('/group/:gSeq', authUtil, controller.getGroup); // 그룹페이지로 이동

router.get('/group/:gSeq/join', authUtil, controller.getGroup); // 모임가입
