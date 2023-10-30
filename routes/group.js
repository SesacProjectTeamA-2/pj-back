const express = require('express');
const router = express.Router();
const controller = require('../controller/Cgroup');

/**
 * @swagger
 * components:
 *   schemas:
 *     postGroup:
 *       required:
 *         - gName
 *         - gDesc
 *         - gDday
 *         - gMaxMem
 *         - gCategory
 *       type: object
 *       description: 모임 생성 시 필요한 정보
 *       properties:
 *         gName:
 *           type: string
 *           description: 모임명 (Unique)
 *           example: Node 스터디
 *         gDesc:
 *           type: string
 *           description: 모임에 대한 설명
 *           example: Node.js 스터디 모임입니다!
 *         gDday:
 *           type: string
 *           format: date-time
 *           description: 모임 자체의 디데이
 *           example: 2023-10-28
 *         gMaxMem:
 *           type: integer
 *           format: int64
 *           description: 모임 최대 인원
 *           example: 10
 *         gCategory:
 *           type: string
 *           description: ex = 운동 / re = 독서 / st = 스터디 / eco = 경제 / lan = 언어 / cert = 자격증 / it = IT / etc = 기타
 *           example: st
 *         gCoverImg:
 *           type: string
 *           description: 모임 커버 이미지
 *           example: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr1_J07ruu0QuBhaD6HSDkvbQdW_OOENXmiA&usqp=CAU
 *     postGroupResult:
 *       required:
 *         - gSeq
 *         - gName
 *         - gDesc
 *         - gDday
 *         - gMaxMem
 *         - gCategory
 *       type: object
 *       description: 모임 정보
 *       properties:
 *         gSeq:
 *           type: integer
 *           format: int64
 *           description: 모임 시퀀스
 *           example: 1
 *         gName:
 *           type: string
 *           description: 모임명 (Unique)
 *           example: Node 스터디
 *         gDesc:
 *           type: string
 *           description: 모임에 대한 설명
 *           example: Node.js 스터디 모임입니다!
 *         gDday:
 *           type: string
 *           format: date-time
 *           description: 모임 자체의 디데이
 *           example: 2023-10-28
 *         gMaxMem:
 *           type: integer
 *           format: int64
 *           description: 모임 최대 인원
 *           example: 10
 *         gCategory:
 *           type: string
 *           description: ex = 운동 / re = 독서 / st = 스터디 / eco = 경제 / lan = 언어 / cert = 자격증 / it = IT / etc = 기타
 *           example: st
 *         gCoverImg:
 *           type: string
 *           description: 모임 커버 이미지
 *           example: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSr1_J07ruu0QuBhaD6HSDkvbQdW_OOENXmiA&usqp=CAU
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 모임 생성 시간
 *           example: 2023-10-28
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 모임 수정 시간
 *           example: 2023-10-28
 * paths:
 *   /api/group:
 *     post:
 *       summary: 모임 생성
 *       description: POST 모임 생성
 *       tags: [Group]
 *       requestBody:
 *         description: 모임을 생성하기 위한 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/postGroup'
 *         required: true
 *       responses:
 *         "200":
 *           description: 생성 완료된 모임 정보
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/postGroupResult'
 *
 */
router.post('/', controller.postGroup); // 모임 생성

module.exports = router;