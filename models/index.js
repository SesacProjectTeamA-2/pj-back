'use strict';
const Sequelize = require('sequelize');
const config = require(__dirname + '/../config/config.js')[
  process.env.NODE_ENV
];
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
User.hasMany(GroupUser, {
  foreignKey: 'uSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupUser.belongsTo(User, {
  foreignKey: 'uSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 2. Group 1 - GroupUser 다
Group.hasMany(GroupUser, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupUser.belongsTo(Group, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 3. Group 1 - Mission 다
Group.hasMany(Mission, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Mission.belongsTo(Group, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 4. Mission 1 - GroupBoard 다
Mission.hasMany(GroupBoard, {
  foreignKey: 'mSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoard.belongsTo(Mission, {
  foreignKey: 'mSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 5. GroupUser 1 - GroupBoard 다
GroupUser.hasMany(GroupBoard, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoard.belongsTo(GroupUser, {
  foreignKey: 'gSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 6. GroupUser 1 - GroupBoard 다
GroupUser.hasMany(GroupBoard, {
  foreignKey: 'uSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoard.belongsTo(GroupUser, {
  foreignKey: 'uSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 7. GroupUser 1 - GroupBoard 다
GroupUser.hasMany(GroupBoard, {
  foreignKey: 'guSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoard.belongsTo(GroupUser, {
  foreignKey: 'guSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 8. GroupBoard 1 - GroupBoardComment 다
GroupBoard.hasMany(GroupBoardComment, {
  foreignKey: 'gbSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoardComment.belongsTo(GroupBoard, {
  foreignKey: 'gbSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// 9. GroupBoard 1 - GroupBoardIcon 다
GroupBoard.hasMany(GroupBoardIcon, {
  foreignKey: 'gbSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
GroupBoardIcon.belongsTo(GroupBoard, {
  foreignKey: 'gbSeq',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

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
