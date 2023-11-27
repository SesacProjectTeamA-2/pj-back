const dotenv = require('dotenv');

const cron = require('node-cron');
dotenv.config({ path: __dirname + '/../config/.env' });
const { User, Group, Mission, GroupBoard, GroupUser } = require('../models');
const sequelize = require('sequelize');
const { Op } = require('sequelize');
const score = require('../modules/rankSystem');

// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');

// 점수 자동 업데이트 함수
const updateScore = async () => {
  try {
    // 현재 날짜를 얻기
    const currentDate = new Date();

    // 현재 날짜에서 하루를 빼서 이전 날짜를 계산
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    // 미션 만료된 모임 추출
    const Groups = await Group.findAll({
      where: {
        gDday: {
          [Op.eq]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 1 DAY)'), // 현재 날짜에서 1일 추가한 날짜와 같은 경우
        },
      },
      attributes: ['gSeq'],
      include: [{ model: Mission, where: { isExpired: { [Op.is]: null } } }],
    });

    if (Groups.length > 0) {
      for (const group of Groups) {
        // 미션 만료
        await Mission.update(
          { isExpired: 'y' },
          { where: { gSeq: group.gSeq } }
        );
        // 누적 점수 업데이트, 현재 점수 초기화
        await GroupUser.update(
          {
            guTotalScore: sequelize.literal('guTotalScore+guNowScore'),
          },
          { where: { gSeq: group.gSeq } }
        );
        await GroupUser.update(
          { guNowScore: 0 },
          { where: { gSeq: group.gSeq } }
        );
        // 그룹 미션 점수 초기화
        await Group.update({ gTotalScore: 0 }, { where: { gSeq: group.gSeq } });
      }
    }
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error('노드 크론 실행 중 서버 에러', error);
    // 에러 핸들링 코드 추가
  }
};

// 하루가 지나는 날(00:01 분에 업데이트 되도록 실행)
cron.schedule('0 1 * * *', () => {
  updateScore();
});

// 유저 미션 리스트
exports.getMission = async (req, res) => {
  try {
    // 1. 로그인 여부
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const user = await jwt.verify(token);
      const uSeq = user.uSeq;
      // 2. 유저 닉네임/캐릭터
      const userInfo = await User.findOne({
        where: { uSeq },
      });
      const { uName, uCharImg, uMainGroup } = userInfo;

      // 3. 모임별 미션 load(), group [디데이, 모임명 - join], mission [미션 제목, 미션만료x(null)], group board[미션완료여부(y) mission join]
      const groupInfo = await GroupUser.findAll({
        where: { uSeq },
        attributes: ['gSeq'],
        group: ['gSeq', 'guSeq'],
        include: [{ model: Group, attributes: ['gName', 'gDday'] }],
      });
      const gSeqArray = groupInfo.map((group) => group.gSeq);
      const groupArray = groupInfo.map((user) => user.tb_group);

      // 모임별 달성률
      const groupDoneRates = [];
      for (const groupSeq of gSeqArray) {
        const doneRate = await score.doneRate(groupSeq, uSeq);

        if (Array.isArray(doneRate)) {
          groupDoneRates.push(...doneRate);
        } else {
          groupDoneRates.push(doneRate);
        }
      }

      // 모임별 미션
      const doneArrays = await GroupBoard.findAll({
        where: { uSeq, gSeq: { [Op.in]: gSeqArray }, mSeq: { [Op.not]: null } },

        attributes: ['mSeq'],
      });

      let missionArray;

      if (doneArrays.length > 0) {
        const arrayValue = doneArrays.map((mseq) => mseq.mSeq);
        missionArray = await Group.findAll({
          attributes: ['gSeq', 'gName'],
          where: {
            gSeq: { [Op.in]: gSeqArray },
          },
          include: [
            {
              model: Mission,
              where: {
                mSeq: { [Op.notIn]: arrayValue },
                isExpired: { [Op.is]: null },
              },
              attributes: ['mTitle', 'mSeq'],
            },
          ],
          order: [['gSeq', 'ASC']],
        });
      } else {
        missionArray = await Group.findAll({
          where: {
            gSeq: { [Op.in]: gSeqArray },
          },
          attributes: ['gSeq', 'gName'],
          include: [
            {
              model: Mission,
              where: {
                isExpired: { [Op.is]: null },
              },
              attributes: ['mTitle', 'mSeq'],
            },
          ],
          order: [['gSeq', 'ASC']],
        });
      }

      // 대표그룹 달성률
      if (uMainGroup) {
        const groupRanking = await score.groupRanking(uMainGroup);

        const nowScoreUserInfo = groupRanking.nowRanking.map(
          (user) => user.tb_user
        );

        const nowRanking = groupRanking.nowRanking.map((item) => {
          return {
            uSeq: item.uSeq,
            guNowScore: item.guNowScore,
          };
        });

        const groupUserRates = groupRanking.doneRates;
        res.send({
          result: true,
          mainGroup: true,
          uName,
          uCharImg,
          groupInfo,
          groupArray,
          missionArray,
          nowScoreUserInfo,
          nowRanking,
          GroupRates: groupUserRates,
          doneRates: groupDoneRates,
        });
      } else {
        res.send({
          result: true,
          mainGroup: false,
          uName,
          uCharImg,
          groupInfo,
          groupArray,
          missionArray,
          doneRates: groupDoneRates,
        });
      }
    } else {
      res.send({ result: false, message: '로그인 해주세요!' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// 그룹 미션 리스트
exports.getGroupMission = async (req, res) => {
  const gSeq = req.params.gSeq;

  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token) {
      res.send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    const gName = await Group.findOne({
      where: { gSeq },
      attributes: ['gName'],
    });

    const missionList = await Mission.findAll({
      where: { gSeq: gSeq, isExpired: { [Op.is]: null } },
      attributes: ['mSeq', 'gSeq', 'mTitle', 'mContent', 'mLevel'],
      group: ['mSeq', 'gSeq'],
    });

    const expiredMissionList = await Mission.findAll({
      where: { gSeq: gSeq, isExpired: 'y' },
      attributes: [
        'mSeq',
        'gSeq',
        'mTitle',
        [sequelize.fn('YEAR', sequelize.col('createdAt')), 'createdYear'],
        [sequelize.fn('MONTH', sequelize.col('createdAt')), 'createdMonth'],
        [sequelize.fn('DAY', sequelize.col('createdAt')), 'createdDay'],
        [sequelize.fn('YEAR', sequelize.col('updatedAt')), 'updatedYear'],
        [sequelize.fn('MONTH', sequelize.col('updatedAt')), 'updatedMonth'],
        [sequelize.fn('DAY', sequelize.col('updatedAt')), 'updatedDay'],
      ],
      group: ['mSeq', 'gSeq'],
    });

    const Dday = await Group.findOne({
      where: { gSeq: gSeq },
      attributes: ['gDday'],
    });

    res.status(200).send({
      missionList,
      gName: gName.gName,
      expiredMissionList,
      Dday: Dday.gDday,
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
    });
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// 미션 수정
exports.editMission = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const { missionArray, deleteList } = req.body;
    // 로그인 여부 확인
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      const user = await jwt.verify(token);

      const uSeq = user.uSeq;
      const uEmail = user.uEmail;
      const uName = user.uName;

      // 모임장 여부 확인
      const isLeader = await GroupUser.findOne({
        where: { gSeq, uSeq },
        attributes: ['guIsLeader'],
      });

      if (isLeader) {
        // 기존 미션 수정시
        for (let missionInfo of missionArray) {
          if (missionInfo.mSeq) {
            // 삭제하고 더할지 or update 할지
            const currentLevel = await Mission.findOne({
              where: { mSeq: missionInfo.mSeq },
              attributes: ['mLevel'],
            });

            if (missionInfo.mLevel > currentLevel) {
              score.groupTotalScore(gSeq, 0, 2);
              console.log('모임 총점수 감소');

              await GroupUser.update(
                { guNowScore: sequelize.literal(`guNowScore + 2`) },
                {
                  where: { gSeq },
                }
              );
              console.log('모임원 현재 점수 증가');
            } else if (missionInfo.mLevel === currentLevel) {
              console.log('수정된 점수가 동일하여 점수 변동 없음.');
            } else {
              score.groupTotalScore(gSeq, 1, 2);
              console.log('모임 총점수 증가');
              await GroupUser.update(
                { guNowScore: sequelize.literal(`guNowScore - 2`) },
                {
                  where: { gSeq },
                }
              );
              console.log('모임원 현재 점수 감소');
            }
            await Mission.update(
              {
                mTitle: missionInfo.mTitle, // 미션 제목
                mContent: missionInfo.mContent, // 미션 내용
                mLevel: missionInfo.mLevel, // 난이도 (상: 5점, 중: 3점, 하: 1점)
              },
              { where: { mSeq: missionInfo.mSeq } }
            );
          } else {
            // 새로운 미션 추가시
            await Mission.create({
              gSeq,
              mTitle: missionInfo.mTitle, // 미션 제목
              mContent: missionInfo.mContent, // 미션 내용
              mLevel: missionInfo.mLevel, // 난이도 (상: 5점, 중: 3점, 하: 1점)
            });

            score.groupTotalScore(gSeq, 0, missionInfo.mLevel);
          }
        }

        // 디데이 수정
        const gDday = missionArray[0].gDday;
        await Group.update({ gDday }, { where: { gSeq } });

        if (deleteList.length > 0) {
          for (let list of deleteList) {
            await Mission.destroy({
              where: { mSeq: list.mSeq },
            });

            // 모임 점수 수정/
            score.groupTotalScore(gSeq, 1, list.mLevel);
            console.log('모임 점수 수정 완료');

            await GroupUser.update(
              { guNowScore: sequelize.literal(`guNowScore - ${list.mLevel}`) },
              { where: { gSeq } }
            );
            console.log('모임원 현재 점수 수정 완료');
          }
        }

        res.status(200).send({
          result: true,
          message: '수정완료',
          uSeq: uSeq,
          uEmail: uEmail,
          uName: uName,
        });
      } else {
        res.send({ result: false, message: '권한이 없어요' });
      }
    } else {
      res.send({ result: false, message: '로그인 해주세요!' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// 미션 삭제
// exports.delMission = async (req, res) => {
//   try {
//     const gSeq = req.params.gSeq;

//     // 로그인 여부
//     if (req.headers.authorization) {
//       let token = req.headers.authorization.split(' ')[1];
//       const user = await jwt.verify(token);

//       const uSeq = user.uSeq;

//       // 모임장 여부 확인
//       const isLeader = await GroupUser.findOne({
//         where: { gSeq, uSeq },
//         attributes: ['guIsLeader'],
//       });
//       if (isLeader) {
//         const mSeq = req.body.mSeq;
//         const mLevel = req.body.mLevel;

//         await Mission.destroy({
//           where: { mSeq },
//         });

//         // 모임 점수 수정/
//         score.groupTotalScore(gSeq, 1, mLevel);
//         console.log('모임 점수 수정 완료');

//         await GroupUser.update(
//           { guNowScore: sequelize.literal(`guNowScore - ${mLevel}`) },
//           { where: { gSeq } }
//         );
//         console.log('모임원 현재 점수 수정 완료');

//         res.send({
//           result: true,
//           message: '삭제 완료',
//         });
//       } else {
//         res.send({ result: false, message: '권한이 없어요' });
//       }
//     } else {
//       res.send({ result: false, message: '로그인 해주세요!' });
//     }
//   } catch {
//     console.error(err);
//     res.send({ isSuccess: false, msg: 'error' });
//   }
// };
