const Meet = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'meet',
    {
      mSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '모임 시퀀스',
      },
      mName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 모임 명 중복 X
        comment: '모임명',
      },
      mDesc: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: null,
        comment: '모임 설명',
      },
      mDday: {
        type: DataTypes.DATEONLY, // 시간은 필요 X
        allowNull: false,
        comment: '모임 디데이',
      },
      mMaxMem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '모임 최대인원',
      },
      mCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        comment:
          '카테고리 = ex: 운동 / re: 독서 / st: 스터디 / eco: 경제 / lan: 언어 / cert: 자격증 / it: IT / etc: 기타',
      },
      mCoverImg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '커버 이미지',
      },
    },
    {
      tableName: 'meet',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = Meet;
