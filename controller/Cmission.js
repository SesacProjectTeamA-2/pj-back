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
          [Op.gte]: previousDate.toISOString().slice(0, 10), // 이전 날짜 이후인 경우
          [Op.lte]: currentDate.toISOString().slice(0, 10), // 현재 날짜 이전인 경우
        },
      },
      include: [{ model: Mission, where: { isExpired: { [Op.is]: null } } }],
      attributes: ['gSeq'],
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
        console.log(
          '1. 누적 점수 업데이트!!!! 2. 미션만료!!! 3. 모임 미션 점수 초기화!!!'
        );
      }
    }
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log('노드 크론 실행 중 서버 에러', error);
    // 에러 핸들링 코드 추가
  }
};

// 하루가 지나는 날(00:01 분에 업데이트 되도록 실행)
cron.schedule('1 0 * * *', () => {
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

      // 3. 그룹별 미션 load(), group [디데이, 모임명 - join], mission [미션 제목, 미션만료x(null)], group board[미션완료여부(y) mission join]
      const groupInfo = await GroupUser.findAll({
        where: { uSeq },
        attributes: ['gSeq'],
        include: [{ model: Group, attributes: ['gName', 'gDday'] }],
      });

      const gSeqArray = groupInfo.map((group) => group.gSeq);
      const groupArray = groupInfo.map((user) => user.tb_group);

      // 그룹별 달성률
      const groupDoneRates = [];
      for (const groupSeq of gSeqArray) {
        const doneRate = await score.doneRate(groupSeq, uSeq);
        if (Array.isArray(doneRate)) {
          groupDoneRates.push(...doneRate);
        } else {
          groupDoneRates.push(doneRate);
        }
      }

      const doneArrays = await GroupBoard.findAll({
        where: { uSeq, gSeq: { [Op.in]: gSeqArray } },
        attributes: ['mSeq'],
      });

      let missionArray;

      if (doneArrays.length > 0) {
        missionArray = await Mission.findAll({
          attributes: ['mTitle', 'mSeq', 'gSeq'],
          where: {
            mSeq: { [Op.in]: doneArrays },
            isExpired: { [Op.is]: null },
          },
        });
      } else {
        missionArray = await Mission.findAll({
          attributes: ['mTitle', 'mSeq', 'gSeq'],
          where: {
            gSeq: { [Op.in]: gSeqArray },
            isExpired: { [Op.is]: null },
          },
          order: [['gSeq', 'ASC']],
        });
      }

      // const doneArray = await Mission.findAll({
      //   attributes: ['mTitle'],
      //   where: { isExpired: { [Op.is]: null } },
      //   include: [{ model: GroupBoard, where: { gbIsDone: { [Op.ne]: 'y' } } }],
      // });

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
        console.log(groupRanking);
        res.json({
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
        res.json({
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
      res.json({ result: false, message: '로그인 해주세요!' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// 그룹 미션 리스트
exports.getGroupMission = async (req, res) => {
  const gSeq = req.params.gSeq;

  try {
    const missionList = await Mission.findAll({
      where: { gSeq: gSeq, isExpired: { [Op.is]: null } },
      attributes: ['mSeq', 'gSeq', 'mTitle', 'mContent', 'mLevel'],
      group: ['mSeq', 'gSeq'],
    });

    const Dday = await Group.findOne({
      where: { gSeq: gSeq },
      attributes: ['gDday'],
    });
    console.log(missionList);
    res.json({
      missionList,
      Dday: Dday.gDday,
    });
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// 미션 수정
exports.editMission = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const missionArray = req.body;
    // 로그인 여부 확인
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      const user = await jwt.verify(token);
      console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

      const uSeq = user.uSeq;

      // 모임장 여부 확인
      const isLeader = await GroupUser.findOne({
        where: { gSeq, uSeq },
        attributes: ['guIsBlackUser'],
      });

      if (isLeader) {
        console.log('미션어레이>>>>>>>>', missionArray);
        // 기존 미션 수정시
        for (let missionInfo of missionArray) {
          console.log(missionInfo);
          if (missionInfo.mSeq) {
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
          }
        }
        const gDday = missionArray[0].gDday;
        await Group.update({ gDday }, { where: { gSeq } });

        res.json({ result: true, message: '수정완료' });
      } else {
        res.json({ result: false, message: '권한이 없어요' });
      }
    } else {
      res.json({ result: false, message: '로그인 해주세요!' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};
