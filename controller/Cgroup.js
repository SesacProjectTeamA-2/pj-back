const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config/.env' });
const { User, Group, GroupUser, Mission } = require('../models');
const { Op } = require('sequelize');

// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');
const secretKey = require('../config/secretkey');

// 모임 페이지 load
exports.getGroup = async (req, res) => {
  const groupSeq = req.params.gSeq;

  // 모임 정보
  const groupInfo = await Group.findOne({ where: { gSeq: groupSeq } });
  const groupMission = await Mission.findAll({
    where: { gSeq: groupSeq, guisBlackUser: { [Op.ne]: 'y' } },
  });
  const groupMem = await User.findAll({
    include: [
      {
        model: GroupUser,
        where: { gSeq: groupSeq },
      },
    ],
    attributes: ['uName'],
  });

  console.log(groupMem);

  const { gName, gDesc, gDday, gCategory, gCoverImg } = groupInfo;
  const missionTitle = groupMission.map((mission) => {
    mission.mTitle;
  });
  const missionContent = groupMission.map((gr) => {
    gr.mContent;
  });

  // 회원인경우
  if (req.headers) {
    let token = req.headers.authorization.split('')[1];
    const userInfo = await jwt.verify(token);
    console.log('토큰 디코딩>>>>>', userInfo);

    // 모임가입여부
    let isMember = await GroupUser.findOne({
      attributes: ['guIsLeader'],
      where: { gSeq: groupSeq, uSeq: userInfo.uSeq },
    });

    if (isMember) {
      let isLeader = isMember && isMember.guIsLeader === 'y';

      return { isLeader, isMember: true };
      // 모임장여부 : true/false
    } else {
      isMember = false;
    }
    console.log('리더여부', isLeader);
    console.log('멤버여부', isMember);

    res.send({
      isLogin: true,
      isMember,
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
  }
  // 비회원인경우
  else {
    res.send({
      isLogin: false,
      missionTitle,
      missionContent,
      groupMem,
      groupName: gName,
      groupInfo: gDesc,
      groupDday: gDday,
      groupCategory: gCategory,
      groupCoverImg: gCoverImg,
    });
  }
};

exports.joinGroup = async (req, res) => {
  const groupSeq = req.params.gSeq;
  authUtil.checkToken(req, tokenRes);

  // 비회원
  if (tokenRes.user.error) {
    res.json({ result: false, message: '회원가입이 필요합니다.' });
  }
  // 회원
  if (tokenRes.user.uSeq) {
    const userJoin = await GroupUser.create({
      gSeq: groupSeq,
      uSeq: tokenRes.user.uSeq,
    });
    console.log(
      '참여 요청-알림-수락의 경우 레디스/웹소켓이 필요할것으로 생각됨.'
    );
  }
};

exports.rankSystem = async (req, res) => {};

// 미션 점수(tb_group - mLevel) : 상=>5 /중=>3 /하=>1

// 회원별 현재 점수(tb_groupUser : guNowScore)
// => 미션완료시의 점수(tb_groupBoard: gSeq, mSeq, uSeq, gbIsDone(y) Join tb_mission(mSeq) = mLevel 총 합) + 회원의 현재점수(tb_groupUser : guNowScore)

// 회원별 누적 점수(tb_groupUser : guTotalScore)
// => Dday 종료시 guNowScore + guTotalScore
// [guNowScore, gTotalScore 모두 초기화/ 모임 미션 만료]

// 모임 미션 총 점수(tb_group : gTotalScore) : 모든 미션의 점수 총 합
//  => gSeq의 mLevel 추출하여 모두 합한 값
