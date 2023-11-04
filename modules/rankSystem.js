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

module.exports = {
  currentScore: async (guSeq, mSeq) => {
    try {
      // 게시글 작성시 => 현재 점수에 미션 난이도에 따른 점수 추가
      const score = await Mission.findOne({
        where: { mSeq: mSeq, isExpired: { [Op.is]: null } },
        attributes: ['mLevel'],
      });

      await GroupUser.update(
        {
          guNowScore: sequelize.literal(`guNowScore + ${score.mLevel}`),
        },
        { where: { guSeq } }
      );
    } catch (err) {
      console.log('에러');
    }
  },

  doneRate: async (gSeq, uSeqArray) => {
    try {
      // 달성률
      // 현재 점수 % 그룹 미션 총 점수 *100
      // 그룹 미션 총 점수
      const missionTotal = await Group.findOne({
        where: { gSeq },
        attributes: ['gTotalScore'],
      });

      if (uSeqArray.length > 0) {
        const userDoneRates = [];

        for (const uSeq of uSeqArray) {
          const userScore = await GroupUser.findOne({
            where: { uSeq: uSeq, gSeq },
            attributes: ['guNowScore'],
          });
          const userDoneRate =
            (userScore.guNowScore / missionTotal.gTotalScore) * 100;
          userDoneRates.push(userDoneRate);
        }
        return userDoneRates;
      } else {
        const userScore = await GroupUser.findOne({
          where: { uSeq: uSeqArray, gSeq },
          attributes: ['guNowScore'],
        });

        const userDoneRate =
          (userScore.guNowScore / missionTotal.gTotalScore) * 100;

        return userDoneRate;
      }
    } catch (err) {
      console.log('에러');
    }
  },

  ranking: async (gSeq) => {
    // 누적 점수 랭킹
    // 달성률 랭킹
  },
};
