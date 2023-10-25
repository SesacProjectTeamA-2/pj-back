const MeetBoardComment = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'meetBoardComment',
    {
      mbcSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '댓글 시퀀스',
      },
      mbcContent: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '댓글 내용',
      },
      mbcDepth1: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '댓글인지 대댓글인지 판단/null:댓글/1:대댓글',
      },
    },
    {
      tableName: 'meetBoardComment',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = MeetBoardComment;
