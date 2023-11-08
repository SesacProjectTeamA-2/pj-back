const GroupBoardComment = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_groupBoardComment',
    {
      gbcSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '댓글 시퀀스',
      },
      gbcContent: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '댓글 내용',
      },
      // gbcDepth1: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      //   defaultValue: null,
      //   comment: '댓글인지 대댓글인지 판단/null:댓글/1:대댓글',
      // },
    },
    {
      tableName: 'tb_groupBoardComment',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = GroupBoardComment;
