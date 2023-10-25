const MeetBoardIcon = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'meetBoardIcon',
    {
      mbiSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '이모티콘 반응 시퀀스',
      },
      mbiEmoji: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '이모티콘 값/추후 작성 예정 (10가지 이모티콘)',
      },
    },
    {
      tableName: 'meetBoardIcon',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = MeetBoardIcon;
