const express = require('express');
const router = express.Router();
const controller = require('../controller/Cboard');

const authUtil = require('../middlewares/auth').checkToken;

// 그룹의 공지사항 게시판
// /board/:gSeq/notice
router.get('/:gSeq/notice', controller.getGroupNotiBoard);

// 그룹의 공지사항 게시글 세부 (자세히보기)
// /board/:gSeq/notice/:gbSeq
router.get('/:gSeq/notice/:gbSeq', controller.getGroupNotiDetail);

// 그룹의 자유 게시판
// /board/:gSeq/free
router.get('/:gSeq/free', controller.getGroupFreeBoard);

// 그룹의 자유 게시글 세부 (자세히보기)
// /board/:gSeq/free/:gbSeq
router.get('/:gSeq/free/:gbSeq', controller.getGroupFreeDetail);

// 그룹의 미션 게시판
// /board/:gSeq/mission/:mseq
router.get('/:gSeq/mission/:mSeq', controller.getGroupMissionBoard);


// 게시글 작성 페이지 작성
// /board/create
router.get('/create', authUtil, controller.getCreateBoard);

// 게시글 작성
// /board/create
router.post('/create', authUtil, controller.createBoard);

module.exports = router;
