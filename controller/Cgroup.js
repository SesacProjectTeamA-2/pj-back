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
// exports.getGroup = (req, res) => {
//   res.send('ok');
// };

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
exports.getJoined = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    if (!token) {
      res.status(401).send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.status(402).send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    // uSeq로 GroupUser 테이블에서 모임에 참여 중인 gSeq 찾기
    const groupUserList = await GroupUser.findAll({
      where: { uSeq, guIsLeader: { [Op.ne]: 'y' } }, // 모임장은 제외 -> 생성한 모임에서 보여주도록
      attributes: ['gSeq'],
    });
    // 참여중인 모임이 없으면
    if (!groupUserList || groupUserList.length === 0) {
      res.status(200).send({
        success: true,
        msg: '현재 참여 중인 모임이 없습니다.',
        data: {
          user: uSeq,
        },
      });
      return;
    }

    // 가져온 gSeq 목록으로 각 모임의 정보 가져오기
    const groupInfo = await Group.findAll({
      where: { gSeq: groupUserList.map((groupUser) => groupUser.gSeq) },
    });

    res.status(200).send({
      success: true,
      msg: '현재 참여 중인 모임 정보 조회 성공',
      groupInfo,
      data: {
        user: uSeq,
      },
    });
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버 에러',
    });
  }
};

// GET '/api/group/made'
// 내가 생성한 모임
exports.getMade = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    if (!token) {
      res.status(401).send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.status(402).send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    // 내가 생성한 그룹의 gSeq 목록 가져오기
    const groupList = await GroupUser.findAll({
      where: { uSeq, guIsLeader: 'y' }, // 모임장인 그룹만
      attributes: ['gSeq'],
    });

    if (!groupList || groupList.length === 0) {
      res.status(200).send({
        success: true,
        msg: '생성한 그룹이 없습니다.',
        data: {
          user: uSeq,
        },
      });
      return;
    }

    // 가져온 gSeq 목록으로 각 그룹의 정보 출력
    const groupInfo = await Group.findAll({
      where: { gSeq: groupList.map((group) => group.gSeq) },
    });

    res.status(200).send({
      success: true,
      msg: '내가 생성한 그룹 정보 조회 성공',
      groupInfo,
      data: {
        user: uSeq,
      },
    });
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버 에러',
    });
  }
};

// 모임장 위임
async function changeGroupLeader(currentLeaderUSeq, gSeq, newLeaderUSeq) {
  try {
    console.log(gSeq, currentLeaderUSeq, newLeaderUSeq);
    if (currentLeaderUSeq === newLeaderUSeq) {
      return { success: false };
    }
    // 현재 모임의 모임장을 모임원으로 변경
    await GroupUser.update(
      { guIsLeader: 'n' },
      {
        where: { gSeq, uSeq: currentLeaderUSeq },
      }
    );

    // 새로운 모임장으로 위임
    await GroupUser.update(
      { guIsLeader: 'y' },
      {
        where: { gSeq, uSeq: newLeaderUSeq },
      }
    );
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// DELETE '/api/group/quit/:gSeq'
// 모임 탈퇴
exports.deleteQuitGroup = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    if (!token) {
      res.status(401).send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.status(402).send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    const gSeq = req.params.gSeq; // 어느 그룹을 탈퇴하려고 하는지 받아오기

    // GroupUser 테이블에서 해당 uSeq와 gSeq 있는지 확인해서 모임에 참여하고 있는 유저인지 확인
    const groupUser = await GroupUser.findOne({
      where: { uSeq, gSeq },
    });

    if (!groupUser) {
      res.status(404).send({
        success: false,
        msg: '모임 탈퇴 실패: 유저가 해당 모임에 속해있지 않습니다.',
      });
      return;
    }

    // Group 정보 있는지 한 번 더 확인
    const group = await Group.findByPk(gSeq);

    if (!group) {
      res.status(404).send({
        success: false,
        msg: '모임 정보를 찾을 수 없습니다.',
      });
      return;
    }
    // 모임장인 경우
    if (groupUser.guIsLeader === 'y') {
      // 모임원 수 확인
      const groupMembersCount = await GroupUser.count({
        where: { gSeq },
      });

      if (groupMembersCount > 1) {
        // 2명 이상 모임원이 있을 경우, 모임장 위임 / guIsLeader: 'n'로 권한 모임원으로 업데이트
        // 모임장 위임 로직 호출
        const newLeaderUSeq = req.body.newLeaderUSeq;

        console.log('uSeq::::::::::::::::', uSeq);
        if (newLeaderUSeq) {
          const changeLeaderResult = await changeGroupLeader(
            uSeq,
            gSeq,
            newLeaderUSeq
          );

          if (changeLeaderResult.success) {
            await GroupUser.destroy({
              where: { uSeq, gSeq },
            });
            res.status(200).send({
              success: true,
              msg: '모임 탈퇴 및 모임장 위임 성공',
            });
            return;
          } else {
            res.status(401).send({
              success: false,
              msg: '모임장 위임 실패',
            });
            return;
          }
        } else {
          res.status(402).send({
            success: false,
            msg: 'newLeaderUSeq가 필요합니다.',
          });
          return;
        }
      }
    }

    // 모임장 아니면 바로 이쪽으로 와서 해당 행 삭제
    await GroupUser.destroy({
      where: { uSeq, gSeq },
    });

    res.status(200).send({
      success: true,
      msg: '모임 탈퇴 성공',
    });
    return;
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버 에러',
    });
  }
};

// GET '/api/group/recommend'
// 추천 모임
// exports.getRecommend = (req, res) => {};

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

    const gCoverImg = req.file.location; // 업로드된 이미지의 S3 URL

    const uSeq = user.uSeq;
    console.log(uSeq);

    const { gName, gDesc, gDday, gMaxMem, gCategory, missionArray } = req.body;

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
    // const inviteLink = generateInviteLink(insertOneGroup.gSeq);

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

    const { gSeq, gName, gDesc, gDday, gMaxMem, gCategory } = req.body;

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

// PATCH '/api/group/groupCoverImg'
// 모임 커버 이미지 수정
exports.groupCoverImg = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);
    const uSeq = user.uSeq;
    console.log(uSeq);

    const gCoverImg = req.file.location; // 업로드된 이미지의 S3 URL

    const { gSeq } = req.body;

    // 현재 모임을 수정하려는 사람이 모임장인지 확인
    const selectOneGroupUser = await GroupUser.findOne({
      where: {
        gSeq,
        uSeq,
      },
    });

    if (selectOneGroupUser) {
      await Group.update(
        {
          gCoverImg,
        },
        {
          where: {
            gSeq,
          },
        }
      );
      res.json({ isSuccess: true, msg: '모임 이미지 수정 완료' });
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

    const nowScoreUserInfo = groupRanking.nowRanking.map(
      (user) => user.tb_user
    );

    const nowRanking = groupRanking.nowRanking.filter((now) => now !== tb_user);

    const totalScoreUserInfo = groupRanking.totalRanking.map(
      (user) => user.tb_user
    );

    const totalRanking = groupRanking.nowRanking.filter(
      (total) => total !== tb_user
    );

    const doneRates = groupRanking.doneRates;

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
        nowRanking,
        totalRanking,
        nowScoreUserInfo,
        totalScoreUserInfo,
        doneRates,
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
        nowRanking,
        totalRanking,
        nowScoreUserInfo,
        totalScoreUserInfo,
        doneRates,
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

// GET '/api/group/chat/:gSeq'
// 모임(별) 채팅
exports.getGroupChat = async (req, res) => {
  try {
    const { gSeq } = req.params;
    // let token = req.headers.authorization.split(' ')[1];
    let token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1TmFtZSI6ImV1bmcgZW8iLCJ1RW1haWwiOiJlb2V1bmcxMTNAZ21haWwuY29tIiwidVNlcSI6MSwiaWF0IjoxNjk5MjYxNTMxfQ.UkGZrK0HKrpbzecPL6AGmk_qLLSwG_gnLJ-1e4if0ag';
    const user = await jwt.verify(token);
    console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

    const uSeq = user.uSeq;
    console.log(uSeq);

    // 해당 모임의 모임원인지 확인
    const groupInfo = await GroupUser.findOne({
      attributes: [
        'gSeq',
        'guIsLeader',
        'tb_group.gName',
        'tb_user.uName',
        'tb_user.uEmail',
      ],
      include: [
        {
          model: Group,
          required: true,
        },
        {
          model: User,
          required: true,
          where: {
            uSeq,
            isUse: {
              // 현재 서비스 이용 가능한 유저
              [Op.eq]: 'y',
            },
          },
        },
      ],
      where: {
        uSeq,
        gSeq,
        guIsBlackUser: {
          [Op.is]: null, // 화이트유저만 가지고온다.
        },
      },
    });

    if (groupInfo) {
      const { guIsLeader } = groupInfo.dataValues;
      const { gName } = groupInfo.dataValues.tb_group;
      const { uName, uEmail } = groupInfo.dataValues.tb_user;

      // 해당 모임에 모임원의 정보가 있는 경우, 채팅 가능
      // 모임별 방번호는 gSeq로 설정
      // Socket.io를 사용하여 클라이언트와 통신할 수 있음
      const io = req.io;
      const connectedClients = {}; // 연결된 클라이언트를 저장할 객체

      io.on('connection', (socket) => {
        socket.on('login', (uSeq) => {
          // 클라이언트에서 로그인 이벤트를 보내면, 연결을 저장하고 해당 연결을 사용
          if (!connectedClients[uSeq]) {
            connectedClients[uSeq] = socket;
            socket.name = uName;
            socket.roomName = gName;
            socket.roomNumber = gSeq;
            console.log('소켓 연결이 이루어졌습니다.');
            // console.log(connectedClients);
          } else {
            // 이미 연결이 있는 경우, 기존 연결을 사용하고 새 연결을 닫음
            socket.disconnect();
          }
        });

        socket.on('groupChat', (gSeq) => {
          socket.name = uName;
          socket.roomName = gName;
          socket.roomNumber = gSeq;
          socket.join(socket.roomNumber);
          console.log(socket.roomName, ' -- ', socket.roomNumber);
        });

        socket.on('chatMessage', (message) => {
          console.log(message);
          io.to(socket.roomNumber).emit(
            'message',
            `${socket.name} : ` + message
          ); // 모든 클라이언트에 메시지를 전송
        });

        socket.on('disconnect', () => {
          console.log('소켓 연결이 끊어졌습니다.');
        });
      });

      // res.status(200).json({ isSuccess: true });
      const { join } = require('node:path');
      res.sendFile(join(__dirname, '/../public/chat.html'));
    } else {
      res
        .status(401)
        .json({ isSuccess: false, msg: '해당 모임의 인원이 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ isSuccess: false, msg: 'error' });
  }
};
