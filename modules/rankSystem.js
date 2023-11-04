const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config/.env' });

const {
  User,
  Group,
  GroupUser,
  GroupBoard,
  GroupBoardComment,
  GroupBoardIcon,
  Mission,
} = require('../models');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const jwt = require('../modules/jwt');

module.exports = {
  currentScore: async (guSeq, mSeq) => {
    // 게시글 작성시 => 현재 점수에 미션 난이도에 따른 점수 추가
    const score = await Mission.findOne({
      where: { mSeq: mSeq, isExpired: { [Op.ne]: 'y' } },
      attributes: ['mLevel'],
    });

    await GroupUser.update(
      {
        guNowScore: sequelize.literal(`guNowScore + ${score}`),
      },
      { where: { guSeq: guSeq } }
    );
  },

  doneRate: async (gSeq, uSeqArray) => {
    // 달성률
    // 현재 점수 % 그룹 미션 총 점수 *100
    // 그룹 미션 총 점수
    const missionTotal = await Group.findOne({
      where: { gSeq: gSeq },
      attributes: ['gTotalScore'],
    });

    const userDoneRates = [];

    for (const uSeq of uSeqArray) {
      const userScore = await GroupUser.findOne({
        where: { uSeq: uSeq, gSeq: gSeq },
        attributes: ['guNowScore'],
      });

      const userDoneRate =
        (userScore.guNowScore / missionTotal.gTotalScore) * 100;
      userDoneRates.push(userDoneRate);
    }
    console.log(userDoneRates);
    return userDoneRates;
  },

  ranking: async (gSeq) => {},
};
