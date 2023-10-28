const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config({ path: __dirname + '/../config/.env' });
const { User, Group, GroupUser, Mission } = require('../models');
const { Op } = require('sequelize');

// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');
const authUtil = require('../middlewares/auth');

// 모임 페이지 load
exports.getGroup = async (req, res) => {
  authUtil.checkToken();

  const groupSeq = req.params.gSeq;

  // 모임장여부 : true/false
  const groupUser = await GroupUser.findOne({
    attributes: ['guIsLeader'],
    where: { gSeq: groupSeq, uSeq: user.uSeq },
  });
  const isLeader = groupUser && groupUser.guIsLeader === 'y';

  // 모임 정보
  const groupInfo = await Group.findOne({ where: { gSeq: groupSeq } });
  const groupMission = await Mission.findAll({
    where: { gSeq: groupSeq, guisBlackUser: { [Op.ne]: 'y' } },
  });
  const members = await GroupUser.findAll({ where: { gSeq: groupSeq } });
  const uSeqArray = members.map((groupUser) => {
    groupUser.uSeq;
  });
  const groupMem = await User.findAll({
    where: { uSeq: uSeqArray },
  });

  const { gName, gDesc, gDday, gCategory, gCoverImg } = groupInfo;
  const missionTitle = groupMission.map((mission) => {
    mission.mTitle;
  });
  const missionContent = groupMission.map((gr) => {
    gr.mContent;
  });

  res.send({
    isLeader,
    missionTitle,
    missionContent,
    groupMem,
    groupName: gName,
    groupInfo: gDesc,
    groupDday: gDday,
    groupCategory: gCategory,
    groupCoverImg: gCoverImg,
  });
};

exports.joinGroup = async (req, res) => {
  const groupSeq = req.params.gSeq;
  authUtil.checkToken();
  // 비회원

  // 회원
};

exports.rankSystem = async (req, res) => {};

// 랭킹 : 점수 = 완료개수 * 순서
// gSeq, uSeq로 특정, mSeq 에 대한 점수는
// 1. 모임의 미션 중 완료여부 y 인 것 추출 => updatedAt 으로 오름차순(과거부터 현재순)
// 2. 점수 부여 : 모임 참여 유저의 gSeq 수가 해당 미션의 만점 : 이후 user는 for 문 -1 로 값 정의
// 3. mSeq 반복
// 4. 해당 uSeq 가진 값들의 총합 = 해당 유저의 총 점수
// 5. 점수 순으로 내림차순 = 랭킹

// 만점 = gSeq의 mSeq의 개수 * 모임참여 유저의 gSeq 수
// 퍼센트 = uSeq의 총 점수/ 만점 * 100
