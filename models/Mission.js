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