const Todo = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'todo',
    {
      tSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: 'todo 시퀀스',
      },
      tTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '미션제목',
      },
      tContent: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '미션 인증 방식',
      },
    },
    {
      tableName: 'todo',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = Todo;
