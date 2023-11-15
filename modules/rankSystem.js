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
      // 이미 게시글이 작성되어있는 경우
      console.log('여기 출력>>>>>>>>>>>>>>>>>>>');
      const isDone = await GroupBoard.findOne({
        where: { mSeq, guSeq, gbIsDone: 'y' },
      });
      if (isDone) {
        console.log('게시글을 작성하여 이미 미션을 완료했습니다.');
        return;
      }
      {
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
      }
    } catch (err) {
      console.error('currentScore 에러:', err.message);
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
      if (missionTotal.gTotalScore === 0) {
        return 0;
      } else {
        if (uSeqArray.length && uSeqArray.length > 0) {
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
      }
    } catch (err) {
      console.error('doneRate 에러:', err.message);
    }
  },

  groupRanking: async (gSeq) => {
    try {
      const uSeqArray = [];

      const groupMem = await GroupUser.findAll({
        where: { gSeq },
        attributes: ['uSeq'],
      });

      for (const member of groupMem) {
        uSeqArray.push(member.uSeq);
      }

      const nowRanking = await GroupUser.findAll({
        where: { gSeq },
        attributes: ['uSeq', 'guNowScore'],
        order: [['guNowScore', 'DESC']],
        include: [{ model: User, attributes: ['uName', 'uSeq', 'uImg'] }],
      });

      const totalRanking = await GroupUser.findAll({
        where: { gSeq },
        attributes: ['uSeq', 'guTotalScore'],
        order: [['guTotalScore', 'DESC']],
        include: [{ model: User, attributes: ['uName', 'uSeq', 'uImg'] }],
      });

      const doneRates = await module.exports.doneRate(gSeq, uSeqArray);

      return { nowRanking, totalRanking, doneRates };
    } catch (err) {
      console.error('groupRanking 에러:', err.message);
    }
  },
};
