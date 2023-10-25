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
const Meet = require('./Meet')(sequelize, Sequelize);
const MeetBoard = require('./MeetBoard')(sequelize, Sequelize);
const MeetBoardComment = require('./MeetBoardComment')(sequelize, Sequelize);
const MeetBoardIcon = require('./MeetBoardIcon')(sequelize, Sequelize);
const MeetUser = require('./MeetUser')(sequelize, Sequelize);
const Todo = require('./Todo')(sequelize, Sequelize);

//=== Relation 설정 ===
// 전체 1:다 관계

// 1. User 1 - MeetUser 다
User.hasMany(MeetUser, { foreignKey: 'uSeq' });
MeetUser.belongsTo(User, { foreignKey: 'uSeq' });

// 2. Meet 1 - MeetUser 다
Meet.hasMany(MeetUser, { foreignKey: 'mSeq' });
MeetUser.belongsTo(Meet, { foreignKey: 'mSeq' });

// 3. Meet 1 - Todo 다
Meet.hasMany(Todo, { foreignKey: 'mSeq' });
Todo.belongsTo(Meet, { foreignKey: 'mSeq' });

// 4. Todo 1 - MeetBoard 다
Todo.hasMany(MeetBoard, { foreignKey: 'tSeq' });
MeetBoard.belongsTo(Todo, { foreignKey: 'tSeq' });

// 5. MeetUser 1 - MeetBoard 다
MeetUser.hasMany(MeetBoard, { foreignKey: 'mSeq' });
MeetBoard.belongsTo(MeetUser, { foreignKey: 'mSeq' });

// 6. MeetUser 1 - MeetBoard 다
MeetUser.hasMany(MeetBoard, { foreignKey: 'uSeq' });
MeetBoard.belongsTo(MeetUser, { foreignKey: 'uSeq' });

// 7. MeetBoard 1 - MeetBoardComment 다
MeetBoard.hasMany(MeetBoardComment, { foreignKey: 'mbSeq' });
MeetBoardComment.belongsTo(MeetBoard, { foreignKey: 'mbSeq' });

// 8. MeetBoard 1 - MeetBoardIcon 다
MeetBoard.hasMany(MeetBoardIcon, { foreignKey: 'mbSeq' });
MeetBoardIcon.belongsTo(MeetBoard, { foreignKey: 'mbSeq' });

db.User = User;
db.Meet = Meet;
db.MeetBoard = MeetBoard;
db.MeetBoardComment = MeetBoardComment;
db.MeetBoardIcon = MeetBoardIcon;
db.MeetUser = MeetUser;
db.Todo = Todo;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
