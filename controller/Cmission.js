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

cron.schedule('01 00 * * *', async () => {
  await Group.update({
    gDday: Sequelize.literal('gDday-1'),
    where: { gDday: { [Op.gte]: 0 } },
  });

const exGroups = await Group.findAll({where: {gDday: 0},
    include:[
        {model: 'Mission',
    where: {isExpired: {[Op.not]: 'y'}}
}]
})

const groupMission = await exGroups.map((gr) => {gr.isExpired})

  if()
});
