const express = require('express');
const router = express.Router();
const controller = require('../controller/Cboard');

const authUtil = require('../middlewares/auth').checkToken;

// 그룹의 공지사항 게시판
// /board/:gSeq/notice
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/notice:
 *     get:
 *       summary: 모임의 공지사항 게시글 전체보기
 *       description: 모임의 공지사항 게시글 전체보기
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/notice', controller.getGroupNotiBoard);

// 그룹의 공지사항 게시글 세부 (자세히보기)
// /board/:gSeq/notice/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/notice/{gbSeq}:
 *     get:
 *       summary: 모임의 공지사항 게시글 상세보기
 *       description: 모임의 공지사항 게시글 상세보기
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/notice/:gbSeq', controller.getGroupNotiDetail);

// 그룹의 자유 게시판
// /board/:gSeq/free
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/free:
 *     get:
 *       summary: 모임의 자유 게시글 전체보기
 *       description: 모임의 자유 게시글 전체보기
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/free', controller.getGroupFreeBoard);

// 그룹의 자유 게시글 세부 (자세히보기)
// /board/:gSeq/free/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/free/{gbSeq}:
 *     get:
 *       summary: 모임의 자유 게시글 상세보기
 *       description: 모임의 자유 게시글 상세보기
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/free/:gbSeq', controller.getGroupFreeDetail);

// 그룹의 미션 게시판
// /board/:gSeq/mission/:mSeq
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/mission/{mSeq}:
 *     get:
 *       summary: 모임의 미션 게시글
 *       description: 모임의 미션 게시글
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *        - $ref: '#/components/parameters/mSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/mission/:mSeq', controller.getGroupMissionBoard);

// 그룹의 미션 게시판
// /board/:gSeq/mission/:mSeq
/**
 * @swagger
 * paths:
 *   /api/board/{gSeq}/mission/{mSeq}/{gbSeq}:
 *     get:
 *       summary: 모임의 미션 게시글 상세
 *       description: 모임의 미션 게시글 상세
 *       tags: [Board]
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqPath'
 *        - $ref: '#/components/parameters/mSeqPath'
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/:gSeq/mission/:mSeq/:gbSeq', controller.getGroupMissionDetail);

// 게시글 작성 페이지
// /board/create
/**
 * @swagger
 * paths:
 *   /api/board/create:
 *     get:
 *       summary: 게시글 작성 페이지
 *       description: 게시글 작성 페이지
 *       tags: [Board]
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/create', authUtil, controller.getCreateBoard);

// 게시글 작성
// /board/create
/**
 * @swagger
 * paths:
 *   /api/board/create:
 *     post:
 *       summary: 게시글 작성
 *       description: 게시글 작성
 *       tags: [Board]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gSeqQuery'
 *        - $ref: '#/components/parameters/categoryQuery'
 *        - $ref: '#/components/parameters/mSeqQuery'
 *       requestBody:
 *         description: 게시글 작성 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createBoard'
 *       responses:
 *         "200":
 *           description: 게시글 작성에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/postBoardResult'
 */
router.post('/create', authUtil, controller.createBoard);

// 게시글 수정 페이지 렌더링
// /board/edit/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/board/edit/{gbSeq}:
 *     get:
 *       summary: 게시글 수정 페이지
 *       description: 게시글 수정 페이지
 *       tags: [Board]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       responses:
 *         200:
 *           description: Successful response
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.get('/edit/:gbSeq', authUtil, controller.getEditBoard);

// 게시글 수정 처리
// /board/edit/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/board/edit/{gbSeq}:
 *     patch:
 *       summary: 게시글 수정
 *       description: 게시글 수정
 *       tags: [Board]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       requestBody:
 *         description: 게시글 수정하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/patchBoard'
 *       responses:
 *         "200":
 *           description: 게시글 수정에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.patch('/edit/:gbSeq', authUtil, controller.editBoard);

// 게시글 삭제 처리
// /board/delete/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/board/delete/{gbSeq}:
 *     delete:
 *       summary: 게시글 삭제
 *       description: 게시글 삭제
 *       tags: [Board]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       requestBody:
 *         description: 게시글 삭제하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/deleteBoard'
 *       responses:
 *         "200":
 *           description: 게시글 삭제에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/boardApiResult'
 */
router.delete('/delete/:gbSeq', authUtil, controller.deleteBoard);

module.exports = router;
