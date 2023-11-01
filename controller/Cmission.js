const dotenv = require('dotenv');
const axios = require('axios');
const cron = require('node-cron');
dotenv.config({ path: __dirname + '/../config/.env' });
const { Group, Mission } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');
const authUtil = require('../middlewares/auth');

// 하루가 지나는 날(00:01 분에 업데이트 되는 data)
// => 모임 d-day, 모임 미션 만료 여부 (null => 'y')
cron.schedule(
  '00 00 * * *',
  async () => {
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
  const token = req.headers.authorization.split(' ')[1];
  const user = await jwt.verify(token);

  // 2. 유저 닉네임/캐릭터
  const userInfo = await User.findOne({
    where: { uSeq: user.uSeq },
  });
  const { uName, uCharImg } = userInfo;

  // 3. 그룹별 미션 load()
  const groups = await Group.findAll({
    where: {},
  });
};
