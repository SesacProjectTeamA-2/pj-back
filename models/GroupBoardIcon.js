const GroupBoardIcon = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_groupBoardIcon',
    {
      gbiSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '이모티콘 반응 시퀀스',
      },
      gbiEmoji: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '이모티콘 값/추후 작성 예정 (10가지 이모티콘)',
      },
    },
    {
      tableName: 'tb_groupBoardIcon',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = GroupBoardIcon;
