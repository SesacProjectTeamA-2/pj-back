const User = (Sequelize, DataTypes) => {
  const model = Sequelize.define(
    'tb_user',
    {
      uSeq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '유저 시퀀스',
      },
      uEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: '가입할 때 이메일 (UNIQUE)',
      },
      uToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: '소셜로그인시 받아오는 코드 또는 토큰 값',
      },
      uName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 닉네임 중복 X
        comment: '유저 닉네임',
      },
      uImg: {
        type: DataTypes.STRING, // VARCHAR(255)
        allowNull: true,
        defaultValue: 0, // 프로필 기본 값 뭘로 설정?
        comment: '프로필이미지',
      },
      uCharImg: {
        type: DataTypes.STRING, // VARCHAR(255)
        allowNull: false,
        defaultValue:
          'https://mblogthumb-phinf.pstatic.net/MjAxODEwMTlfMTgx/MDAxNTM5OTI4MjAwNDEx.k7oG-Q0tA6bdI1smaMzsK4t08NREjRrq3OthZKoIz8Qg.BeZxWi7HekwTWipOckbNWpvnesXuHjpldNGA7QppprUg.JPEG.retspe/eb13.jpg?type=w800', // 캐릭터 이미지 기본 값?
        comment: '캐릭터이미지',
      },
      uCoverImg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0, // 커버의 디폴트 이미지?
        comment: '커버이미지',
      },
      uDesc: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null, // 자기소개 기본 값
        comment: '자기소개',
      },

      uCategory: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: '관심분야',
      },
      uSetDday: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: 'n',
        comment: '대표 디데이 설정 여부',
      },
      uMainDday: {
        type: DataTypes.INTEGER, // 대표 모임 디데이,달성률 null값?
        allowNull: true,
        defaultValue: null,
        comment: '대표모임디데이',
      },
      uMainMeet: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '대표모임달성률',
      },
    },
    {
      tableName: 'tb_user',
      freezeTableName: true,
      timestamps: true,
    }
  );
  return model;
};

module.exports = User;
