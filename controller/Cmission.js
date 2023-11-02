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

function calculateDDay(targetDate) {
  const currentDate = new Date();
  const target = new Date(targetDate);

  // 날짜 차이를 밀리초 단위로 계산
  const timeDiff = target - currentDate;

  // 밀리초를 일(day)로 변환
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysRemaining;
}

cron.schedule(
  '* * * * *',
  async () => {
    console.log('크론 실행!!!!');

    const today = new Date(); // 현재 날짜와 시간을 가져옵니다.
    const year = today.getFullYear(); // 현재 연도를 가져옵니다.
    const month = today.getMonth() + 1; // 현재 월을 가져옵니다 (0부터 시작하므로 1을 더해줍니다).
    const day = today.getDate(); // 현재 날짜를 가져옵니다.

    const exGroups = await Group.findAll({
      where: {
        gDday: {
          [Op.lt]: new Date(year, month, day),
        },
      },
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
    const groupInfo = await GroupUser.findAll({
      where: { uSeq: user.uSeq },
      attributes: ['gSeq'],
      include: [{ model: Group }, { attributes: ['gName', 'gDday'] }],
    });

    const gSeqArray = groups.map((group) => group.gSeq);

    const missionArray = await Mission.findAll({
      attributes: ['mSeq', 'gSeq', 'mTitle'],
      where: { gSeq: { [Op.in]: gSeqArray }, isExpired: { [Op.ne]: 'y' } },
      group: 'gSeq',
    });

    const doneArray = await GroupBoard.findAll({
      where: { gbIsDone: 'y' },
      attributes: ['mSeq'],
      include: [{ model: Mission }],
    });

    const isDoneArray = doneArray.map((done) => done.mSeq);

    res.json({
      result: true,
      uName,
      uCharImg,
      groupInfo,
      isDone: isDoneArray,
      missionArray,
    });
  } else {
    res.json({ result: false, message: '로그인 해주세요!' });
  }
};
