const Mission = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_mission',
    {
      mSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '미션 시퀀스',
      },
      mTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '미션제목',
      },
      mContent: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '미션 인증 방식',
      },
      isExpired: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: '미션 d-day 만료 여부',
      },
      mLevel: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '난이도에 따른 점수 부여 차이',
      },
    },
    {
      tableName: 'tb_mission',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = Mission;
