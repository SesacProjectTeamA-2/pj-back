const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');

router.post('/', controller.postGroup); // 모임 생성

module.exports = router;
