const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');
const authUtil = require('../middlewares/auth').checkToken;

/**
 * @swagger
 * paths:
 *  /api/group/{gSeq}:
 *    get:
 *      summary: "모임 페이지"
 *      description: "모임 페이지 로드"
 *      tags: [userRouter]
 *       parameters:
 *       - in: path
 *         name: gSeq
 *         description: 모임 시퀀스
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: "모임 정보 전송"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isLeader:
 *                   type: boolean
 *                   description: 모임장 여부 (true/false)
 *                 missionTitle:
 *                   type: array
 *                   description: 미션 제목 목록
 *                   items:
 *                     type: string
 *                 missionContent:
 *                   type: array
 *                   description: 미션 내용 목록
 *                   items:
 *                     type: string
 *                 groupMem:
 *                   type: array
 *                   description: 모임 멤버 정보 목록
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 groupName:
 *                   type: string
 *                   description: 모임 이름
 *                 groupInfo:
 *                   type: string
 *                   description: 모임 설명
 *                 groupDday:
 *                   type: string
 *                   description: 모임 디데이
 *                 groupCategory:
 *                   type: string
 *                   description: 모임 카테고리
 *                 groupCoverImg:
 *                   type: string
 *                   description: 모임 커버 이미지 URL
 */
router.get('/group/:gSeq', authUtil, controller.getGroup); // 그룹페이지로 이동

/**
 * @swagger
 * paths:
 *   /api/group/{gSeq}/join:
 *     get:
 *       summary: "모임 가입"
 *       description: "모임에 가입하는 요청을 처리합니다."
 *       tags: [userRouter]
 *       parameters:
 *         - in: path
 *           name: gSeq
 *           description: "모임 시퀀스"
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         '200':
 *           description: "모임 가입 성공"
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: boolean
 *                     description: "요청 성공 여부"
 *                   message:
 *                     type: string
 *                     description: "결과 메시지"
 *         '401':
 *           description: "회원가입이 필요합니다."
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   result:
 *                     type: boolean
 *                     description: "요청 실패 여부"
 *                   message:
 *                     type: string
 *                     description: "회원가입이 필요함을 알리는 메시지"
 */
router.get('/group/:gSeq/join', authUtil, controller.getGroup); // 모임가입
