const express = require('express');
const router = express.Router();
const controller = require('../controller/Ccomment');

const authUtil = require('../middlewares/auth').checkToken;

// 게시글 댓글 생성 처리
// /comment/create/:gbSeq
/**
 * @swagger
 * paths:
 *   /api/comment/create/{gbSeq}:
 *     post:
 *       summary: 게시글에 댓글 작성
 *       description: 게시글에 댓글 작성
 *       tags: [Comment]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbSeqPath'
 *       requestBody:
 *         description: 댓글 작성 위해 필요한 gbSeq
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createComment'
 *       responses:
 *         "200":
 *           description: 댓글 작성에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/postCommentResult'
 */
router.post('/create/:gbSeq', authUtil, controller.createComment);

// 댓글 수정 처리
// /comment/edit/:gbcSeq
/**
 * @swagger
 * paths:
 *   /api/comment/edit/{gbcSeq}:
 *     patch:
 *       summary: 댓글 수정
 *       description: 댓글 수정
 *       tags: [Comment]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbcSeqPath'
 *       requestBody:
 *         description: 댓글 수정하기 위해 필요한 정보
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/patchComment'
 *       responses:
 *         "200":
 *           description: 댓글 수정에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/commentApiResult'
 */
router.patch('/edit/:gbcSeq', authUtil, controller.editComment);

// 댓글 삭제 처리
// /comment/delete/:gbcSeq
/**
 * @swagger
 * paths:
 *   /api/comment/delete/{gbcSeq}:
 *     delete:
 *       summary: 댓글 삭제
 *       description: 댓글 삭제
 *       tags: [Comment]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *        - $ref: '#/components/parameters/gbcSeqPath'
 *       responses:
 *         "200":
 *           description: 댓글 삭제에 대한 성공 여부/메시지
 *           required: true
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/commentApiResult'
 */
router.delete('/delete/:gbcSeq', authUtil, controller.deleteComment);

module.exports = router;
