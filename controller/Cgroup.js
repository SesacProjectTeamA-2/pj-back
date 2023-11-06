const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../config/.env' });

const {
  User,
  Group,
  GroupUser,
  GroupBoard,
  GroupBoardComment,
  GroupBoardIcon,
  Mission,
} = require('../models');
const Op = require('sequelize').Op;
const sequelize = require('sequelize');
const jwt = require('../modules/jwt');
const ranking = require('../modules/rankSystem');
const { v4: uuidv4 } = require('uuid'); // 모임 링크 생성

// GET '/api/group/:id'
// 모임 정보 조회(상세 화면)
exports.getGroup = (req, res) => {
  res.send('ok');
};

// GET '/api/group?search=###&category=###'
// 모임 조회 (검색어 검색 / 카테고리 검색)
exports.getGroups = async (req, res) => {
  try {
    let { search, category } = req.query;
    if (!search) search = '';
    if (!category || (Array.isArray(category) && category.length === 0)) {
      category = ['ex', 're', 'st', 'eco', 'lan', 'cert', 'it', 'etc'];
    } else {
      category = category.split(',');
    }

    console.log(search);
    console.log(category);

    const selectGroups = await Group.findAndCountAll({
      where: {
        [Op.or]: [
          {
            gName: { [Op.like]: `%${search}%` },
          },
          {
            gDesc: { [Op.like]: `%${search}%` },
          },
          {
            gCategory: { [Op.in]: category },
          },
        ],
      },
    });

    if (selectGroups.count > 0) {
      res.json({
        count: selectGroups.count,
        groupArray: selectGroups.rows,
      });
    } else {
      res.json({ isSuccess: true, msg: '해당하는 모임이 없습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// GET '/api/group/joined'
// 현재 참여하고 있는 모임
exports.getJoined = (req, res) => {};

// GET '/api/group/made'
// 내가 생성한 모임
exports.getMade = (req, res) => {};

// GET '/api/group/recommend'
// 추천 모임
exports.getRecommend = (req, res) => {};

// POST '/api/group'
// 모임 생성
exports.postGroup = async (req, res) => {
  // [3가지 로직을 구현]
  // 1) 모임 생성 → gSeq
  // 2) 모임장을 모임 참여 유저에 추가
  // 3) 모임 생성 화면에서 등록한 미션 등록
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    const { gName, gDesc, gDday, gMaxMem, gCategory, gCoverImg, missionArray } =
      req.body;

    // 1) 모임 생성 → gSeq
    const insertOneGroup = await Group.create({
      gName, // 모임명
      gDesc, // 설명
      gDday, // 디데이
      gMaxMem, // 최대인원
      gCategory, // 카테고리
      gCoverImg, // 커버 이미지
    });

    console.log(insertOneGroup);

    // db에 모임 정보 저장 후 gSeq로 링크 생성
    const inviteLink = generateInviteLink(insertOneGroup.gSeq);

    // 2) 모임장을 모임 참여 유저에 추가
    if (insertOneGroup) {
      const insertOneGroupUser = await GroupUser.create({
        gSeq: insertOneGroup.gSeq,
        uSeq,
        guIsLeader: 'y',
      });

      console.log(insertOneGroupUser);

      // 3) 모임 생성 화면에서 등록한 미션 등록
      let mCnt = 0;
      if (insertOneGroupUser) {
        for (let missionInfo of missionArray) {
          await Mission.create({
            gSeq: insertOneGroup.gSeq,
            mTitle: missionInfo.mTitle, // 미션 제목
            mContent: missionInfo.mContent, // 미션 내용
            mLevel: missionInfo.mLevel, // 난이도 (상: 5점, 중: 3점, 하: 1점)
          });

          await Group.update(
            {
              gTotalScore: sequelize.literal(
                `gTotalScore + ${missionInfo.mLevel}`
              ),
            },
            { where: { gSeq: insertOneGroup.gSeq } }
          );

          mCnt++;
        }

        if (missionArray.length === mCnt) {
          res.json({ isSuccess: true, msg: '모임 생성에 성공했습니다.' });
        } else {
          res.json({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
        }
      } else {
        res.json({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
      }
    } else {
      res.json({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// PATCH '/api/group'
// 모임 수정
exports.patchGroup = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    const { gSeq, gName, gDesc, gDday, gMaxMem, gCategory, gCoverImg } =
      req.body;

    // 현재 모임을 수정하려는 사람이 모임장인지 확인
    const selectOneGroupUser = await GroupUser.findOne({
      where: {
        gSeq,
        uSeq,
      },
    });

    if (selectOneGroupUser) {
      const updateOneGroup = await Group.update(
        {
          gName,
          gDesc,
          gDday,
          gMaxMem,
          gCategory,
          gCoverImg,
        },
        {
          where: {
            gSeq,
          },
        }
      );

      if (updateOneGroup) {
        res.json({ isSuccess: true, msg: '모임 수정에 성공했습니다' });
      } else {
        res.json({ isSuccess: false, msg: '모임 수정에 실패했습니다' });
      }
    } else {
      res.json({ isSuccess: false, msg: '모임장이 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// DELETE '/api/group'
// 모임 삭제
exports.deleteGroup = async (req, res) => {
  // [3가지 로직을 구현]
  // 1) 현재 삭제하는 사람이 모임장인지 확인
  // 2) 만약 모임장이라면, 모임장 위임 화면으로 이동
  //    - 모임장을 포함한 모임원이 최소 2명 이상이면, 무조건 위임화면으로 이동해서 위임해야함
  //     ※ 모임원이 혼자인 경우는 바로 삭제
  // 3) 모임이 삭제되면 관련 정보는 전부 삭제
  //    (1) 모임 정보
  //    (2) 모임 참여 유저
  //    (3) 미션
  //    (4) 게시글
  //    (5) 댓글
  //    (6) 게시글에 대한 이모티콘 반응

  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    const { gSeq } = req.body;

    // 1) 현재 삭제하는 사람이 모임장인지 확인
    const selectOneGroupUser = await GroupUser.findOne({
      where: {
        gSeq,
      },
    });

    console.log(selectOneGroupUser);

    // y = 모임장, null = 모임원
    if (selectOneGroupUser.guIsLeader) {
      // 2) 모임장을 포함한 모임 인원 확인 (2명 이상이면 모임장 위임 화면으로 이동)
      const countGroupUser = await GroupUser.count({
        where: {
          gSeq,
        },
      });

      console.log(countGroupUser);

      // 모임원이 2명 이상이면 모임장 위임하는 화면으로 이동
      if (countGroupUser > 1) {
        res.json({ isSuccess: false, msg: '모임장 위임을 해야합니다.' });

        // 모임장인데, 모임원이 모임장 혼자인 경우는 모임 관련 데이터 삭제
      } else {
        // 3) 모임 관련 정보 모두 삭제
        //    (1) 모임 정보 삭제
        //    (2) 모임 참여 유저 삭제
        //    (3) 미션 삭제
        //    (4) 게시글 삭제
        //    (5) 댓글 삭제
        //    (6) 게시글에 대한 이모티콘 반응 삭제
        const deleteOneGroup = await Group.destroy({
          where: {
            gSeq,
          },
        });

        if (deleteOneGroup) {
          res.json({ isSuccess: true, msg: '모임 삭제에 성공했습니다' });
        } else {
          res.json({ isSuccess: false, msg: '모임 삭제에 실패했습니다' });
        }
      }
    } else {
      res.json({ isSuccess: false, msg: '모임장이 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    res.json({ isSuccess: false, msg: 'error' });
  }
};

// 디데이 계산함수.
function calculateDDay(targetDate) {
  const currentDate = new Date();
  const target = new Date(targetDate);

  // 날짜 차이를 밀리초 단위로 계산
  const timeDiff = target - currentDate;

  // 밀리초를 일(day)로 변환
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysRemaining;
}

// 모임 페이지 load
exports.getGroupDetail = async (req, res) => {
  try {
    const groupSeq = req.params.gSeq;
    // 모임 정보
    const groupInfo = await Group.findOne({ where: { gSeq: groupSeq } });

    const { gName, gDesc, gDday, gMaxMem, gCategory, gCoverImg } = groupInfo;

    const groupDday = calculateDDay(gDday);

    const groupMission = await Mission.findAll({
      where: { gSeq: groupSeq, isExpired: { [Op.is]: null } },
    });

    const memberArray = await GroupUser.findAll({
      attributes: ['guSeq', 'uSeq', 'guIsLeader'],
      order: [['guSeq', 'ASC']],
      where: { gSeq: groupSeq },
      include: [
        {
          model: User,
          attributes: ['uName', 'uImg', 'uCharImg'],
        },
      ],
    });

    const groupRanking = await ranking.groupRanking(groupSeq);

    console.log('그룹 랭킹>>>>>>>>>>', groupRanking);

    // 회원인 경우
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      const user = await jwt.verify(token);
      console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

      const groupUser = await GroupUser.findOne({
        attributes: ['guSeq', 'guIsLeader'],
        where: { gSeq: groupSeq, uSeq: user.uSeq },
      });

      // 모임에 가입한 경우
      let isLeader;
      let isJoin;
      if (groupUser) {
        isJoin = true;
        // 모임장여부 : true/false
        isLeader = groupUser && groupUser.guIsLeader === 'y' ? true : false;
      } else {
        // 모임 가입하지 않은 경우
        isJoin = false;
        isLeader = false;
      }

      res.json({
        result: true,
        isJoin,
        isLeader,
        groupMission,
        groupMember: memberArray,
        groupName: gName,
        groupMaxMember: gMaxMem,
        grInformation: gDesc,
        groupDday: groupDday,
        groupCategory: gCategory,
        groupCoverImg: gCoverImg,
        groupRanking,
      });
      // 비회원인경우
    } else {
      res.json({
        result: false,
        groupMission,
        groupMember: memberArray,
        groupName: gName,
        grInformation: gDesc,
        groupDday: groupDday,
        groupCategory: gCategory,
        groupCoverImg: gCoverImg,
        groupRanking,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(err.statusCode || 500).send({
      msg: err.message,
      OK: false,
    });
  }
};

exports.joinGroup = async (req, res) => {
  const groupSeq = req.params.gSeq;

  // 로그인상태
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const userJoin = await GroupUser.create({
      gSeq: groupSeq,
      uSeq: user.uSeq,
    });
    console.log(
      '참여 요청-알림-수락의 경우 레디스/웹소켓이 필요할것으로 생각됨.'
    );
  } else {
    res.json({ result: false, message: '먼저 로그인 해주세요.' });
  }
};
