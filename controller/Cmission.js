const dotenv = require('dotenv');
const axios = require('axios');
const cron = require('node-cron');
dotenv.config({ path: __dirname + '/../config/.env' });
const { User, Group, Mission, GroupBoard, GroupUser } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');
const authUtil = require('../middlewares/auth');

// 하루가 지나는 날(00:01 분에 업데이트 되는 data)
// => 모임 d-day, 모임 미션 만료 여부 (null => 'y')
cron.schedule(
  '* * * * *',
  async () => {
    console.log('크론 실행!!!!');
    await Group.update(
      {
        gDday: Sequelize.literal('gDday-1'),
      },
      { where: { gDday: { [Op.gte]: 0 } } }
    );

    const exGroups = await Group.findAll({
      where: { gDday: 0 },
      include: [{ model: 'Mission', where: { isExpired: { [Op.not]: 'y' } } }],
      attributes: ['uSeq'],
    });
    if (exGroups) {
      for (const group of exGroups) {
        await Mission.update(
          { isExpired: 'y' },
          { where: { gSeq: group.gSeq } }
        );
      }
    }
  },
  {
    timezone: Asia / Seoul,
  }
);

// 미션 리스트
exports.getMission = async (req, res) => {
  // 1. 로그인 여부
  if (req.headers) {
    const token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    // 2. 유저 닉네임/캐릭터
    const userInfo = await User.findOne({
      where: { uSeq: user.uSeq },
    });
    const { uName, uCharImg } = userInfo;

    // 3. 그룹별 미션 load(), group [디데이, 모임명 - join], mission [미션 제목, 미션만료x(null)], group board[미션완료여부(y) mission join]
    const groups = await GroupUser.findAll({
      where: { uSeq: user.uSeq },
      attributes: ['gSeq'],
      include: [{ model: Group }, { attributes: ['gName', 'gDday'] }],
    });

    console.log(groups);

    const gSeqArray = groups.map((group) => group.gSeq);

    const missionArray = await Mission.findAll({
      attributes: ['mSeq', 'gSeq', 'mTitle'],
      where: { gSeq: { [Op.in]: gSeqArray }, isExpired: { [Op.ne]: 'y' } },
    });
    const groupMission = missionArray.map((mission) => mission.mTitle);

    const groupInfo = gSeqArray.reduce((result, gSeq) => {
      const group = groups.find((group) => group.gSeq === gSeq);
      const groupMissions = missionArray.filter(
        (mission) => mission.gSeq === gSeq
      );

      if (group && groupMissions.length > 0) {
        result.push({
          gSeq: gSeq,
          // gName: group.Group.gName,
          // gDday: group.Group.gDday,
          missions: groupMissions.map((mission) => ({
            mSeq: mission.mSeq,
            mTitle: mission.mTitle,
          })),
        });
      }

      return result;
    }, []);

    const doneArray = await GroupBoard.findAll({
      where: { gbIsDone: 'y' },
      attributes: ['mSeq'],
      include: [{ model: Mission }],
    });

    const isDoneArray = doneArray.map((done) => done.mSeq);

    res.json({
      uName,
      uCharImg,
      groupInfo,
      isDone: isDoneArray,
    });
  } else {
    res.json({ result: false, message: '로그인 해주세요!' });
  }
};
