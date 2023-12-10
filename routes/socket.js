const express = require('express');
const router = express.Router();
const controller = require('../controller/Csocket');
const authUtil = require('../middlewares/auth').checkToken;

router.get('/chat', controller.getGroupChats); // 모임(별) 채팅

module.exports = router;
