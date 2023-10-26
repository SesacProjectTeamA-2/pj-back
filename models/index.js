'use strict';

const Sequelize = require('sequelize');
const config = require(__dirname + '/../config/config.js')[process.env.NODE_ENV];
const db = {};

const { database, username, password } = config;
const sequelize = new Sequelize(database, username, password, config); // db, user, password, config 객체 저장

// Sequelize 모델
const User = require('./User')(sequelize, Sequelize);
const Group = require('./Group')(sequelize, Sequelize);
const GroupBoard = require('./GroupBoard')(sequelize, Sequelize);
const GroupBoardComment = require('./GroupBoardComment')(sequelize, Sequelize);
const GroupBoardIcon = require('./GroupBoardIcon')(sequelize, Sequelize);
const GroupUser = require('./GroupUser')(sequelize, Sequelize);
const Mission = require('./Mission')(sequelize, Sequelize);

//=== Relation 설정 ===
// 전체 1:다 관계

// 1. User 1 - GroupUser 다
User.hasMany(GroupUser, { foreignKey: 'uSeq' });
GroupUser.belongsTo(User, { foreignKey: 'uSeq' });

// 2. Group 1 - GroupUser 다
Group.hasMany(GroupUser, { foreignKey: 'gSeq' });
GroupUser.belongsTo(Group, { foreignKey: 'gSeq' });

// 3. Group 1 - Mission 다
Group.hasMany(Mission, { foreignKey: 'gSeq' });
Mission.belongsTo(Group, { foreignKey: 'gSeq' });

// 4. Mission 1 - GroupBoard 다
Mission.hasMany(GroupBoard, { foreignKey: 'mSeq' });
GroupBoard.belongsTo(Mission, { foreignKey: 'mSeq' });

// 5. GroupUser 1 - GroupBoard 다
GroupUser.hasMany(GroupBoard, { foreignKey: 'gSeq' });
GroupBoard.belongsTo(GroupUser, { foreignKey: 'gSeq' });

// 6. GroupUser 1 - GroupBoard 다
GroupUser.hasMany(GroupBoard, { foreignKey: 'uSeq' });
GroupBoard.belongsTo(GroupUser, { foreignKey: 'uSeq' });

// 7. GroupBoard 1 - GroupBoardComment 다
GroupBoard.hasMany(GroupBoardComment, { foreignKey: 'gbSeq' });
GroupBoardComment.belongsTo(GroupBoard, { foreignKey: 'gbSeq' });

// 8. GroupBoard 1 - GroupBoardIcon 다
GroupBoard.hasMany(GroupBoardIcon, { foreignKey: 'gbSeq' });
GroupBoardIcon.belongsTo(GroupBoard, { foreignKey: 'gbSeq' });

db.User = User;
db.Group = Group;
db.GroupBoard = GroupBoard;
db.GroupBoardComment = GroupBoardComment;
db.GroupBoardIcon = GroupBoardIcon;
db.GroupUser = GroupUser;
db.Mission = Mission;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
