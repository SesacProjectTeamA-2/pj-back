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
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: '가입할 때 이메일 (UNIQUE)',
      },
      uName: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true, // 닉네임 중복 X
        comment: '유저 닉네임',
      },
      uImg: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 0, // 프로필 기본 값 뭘로 설정?
        comment: '프로필이미지',
      },
      uCharImg: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null, // 자기소개 기본 값
        comment: '자기소개',
      },
      uCategory1: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
        comment: '관심분야1',
      },
      uCategory2: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
        comment: '관심분야2',
      },
      uCategory3: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: null,
        comment: '관심분야3',
      },
      uPhrase: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: '내가 적은 명언, 좌우명',
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
      uMainGroup: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: '대표모임달성률',
      },
      isAdmin: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: null,
        comment: '관리자여부',
      },
      isUse: {
        type: DataTypes.STRING(1),
        allowNull: true,
        defaultValue: null,
        comment: '사용 가능 여부(y: 현재 서비스 가능한 유저 / null: 관리자로 부터 추방된 유저)',
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
