'use strict';

const Sequelize = require('sequelize');
const config = require(__dirname + '/../config/config.js')[process.env.NODE_ENV];
const db = {};

const { database, username, password } = config;
const sequelize = new Sequelize(database, username, password, config); // db, user, password, config 객체 저장

// Sequelize 모델
const User = require('./User')(sequelize, Sequelize);

db.User = User;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
