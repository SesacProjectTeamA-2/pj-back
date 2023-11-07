const Group = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_group',
    {
      gSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '모임 시퀀스',
      },
      gName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 모임 명 중복 X
        comment: '모임명',
      },
      gDesc: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: null,
        comment: '모임 설명',
      },
      gDday: {
        type: DataTypes.DATEONLY, // 시간은 필요 X
        allowNull: false,
        comment: '모임 디데이',
      },
      gMaxMem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '모임 최대인원',
      },
      gCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        comment:
          '카테고리 = ex: 운동 / re: 독서 / st: 스터디 / eco: 경제 / lan: 언어 / cert: 자격증 / it: IT / etc: 기타',
      },
      gCoverImg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '커버 이미지',
      },
      gTotalScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '모임 미션 현재 점수',
      },
      // gLink: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      //   defaultValue: null,
      //   comment: '모임 초대 위한 링크',
      // },
    },
    {
      tableName: 'tb_group',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = Group;
