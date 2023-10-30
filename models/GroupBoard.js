const GroupBoard = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_groupBoard',
    {
      gbSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '게시글 시퀀스',
      },
      gbTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '게시글 제목',
      },
      gbContent: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: '게시글 내용',
      },
      gbIsDone: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'y',
        comment:
          '완료여부 : mSeq == null이면 그 게시글은 공지 혹은 자유 / mSeq있으면 미션',
      },
      gbCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '카테고리 : notice: 공지 / free: 자유/mission:미션',
      },
    },
    {
      tableName: 'tb_groupBoard',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = GroupBoard;
