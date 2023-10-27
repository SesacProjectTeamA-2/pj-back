const GroupUser = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_groupUser',
    {
      guSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '모임 참여 유저 시퀀스 (아예 쓰지 않을 예정인 값)',
      },
      guIsLeader: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: null,
        comment: '모임장여부 (y: 모임장 / null: 모임원)',
      },
      guIsBlackUser: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: null,
        comment: '블랙유저여부 (y: 블랙유저 / null: 화이트유저)',
      },
      guBanReason: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '강퇴사유',
      },
    },
    {
      tableName: 'tb_groupUser',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = GroupUser;
