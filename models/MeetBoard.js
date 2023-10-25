const MeetBoard = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'meetBoard',
    {
      mbSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '게시글 시퀀스',
      },
      mbTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '게시글 제목',
      },
      mbContent: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '게시글 내용',
      },
      mbIdDone: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'y',
        comment:
          '완료여부 : tSeq == null이면 그 게시글은 공지 혹은 자유 / tSeq있으면 미션',
      },
      mbCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '카테고리 : notice: 공지 / free: 자유/mission:미션',
      },
    },
    {
      tableName: 'meetBoard',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = MeetBoard;
