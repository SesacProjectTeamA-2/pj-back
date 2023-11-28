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
const Score = require('../modules/rankSystem');
const { v4: uuidv4 } = require('uuid'); // 모임 링크 생성

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

    const selectGroups = await Group.findAndCountAll({
      where: {
        [Op.or]: [
          {
            gName: { [Op.like]: `%${search}%` },
          },
          {
            gDesc: { [Op.like]: `%${search}%` },
          },
        ],
        [Op.and]: [
          {
            gCategory: { [Op.in]: category },
          },
        ],
      },
    });

    if (selectGroups.count > 0) {
      res.send({
        count: selectGroups.count,
        groupArray: selectGroups.rows,
      });
    } else {
      res.send({ isSuccess: true, msg: '해당하는 모임이 없습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// GET '/api/group/joined'
// 현재 참여하고 있는 모임
exports.getJoined = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token) {
      res.send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    // uSeq로 GroupUser 테이블에서 모임에 참여 중인 gSeq 찾기
    const groupUserList = await GroupUser.findAll({
      where: { uSeq, guIsLeader: { [Op.is]: null } }, // 모임장은 제외 -> 생성한 모임에서 보여주도록
      attributes: ['gSeq'],
    });

    const groups = groupUserList.map((list) => list.gSeq);

    const guNumber = await GroupUser.count({
      where: { gSeq: { [Op.in]: groups } },
      group: ['gSeq'],
      attributes: ['gSeq'],
      include: [{ model: Group }],
    });

    // 참여중인 모임이 없으면
    if (!groupUserList || groupUserList.length === 0) {
      res.status(200).send({
        success: true,
        msg: '현재 참여 중인 모임이 없습니다.',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
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
      groupUserCount: guNumber,
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
    });
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error(error);
    res.send({
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

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token) {
      res.send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.send({
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

    const groups = groupList.map((list) => list.gSeq);

    const guNumber = await GroupUser.count({
      where: { gSeq: { [Op.in]: groups } },
      group: ['gSeq'],
      attributes: ['gSeq'],
      include: [{ model: Group }],
    });

    if (!groupList || groupList.length === 0) {
      res.status(200).send({
        success: true,
        msg: '생성한 그룹이 없습니다.',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
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
      groupUserCount: guNumber,
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
    });
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error(error);
    res.send({
      success: false,
      msg: '서버 에러',
    });
  }
};

// 모임장 위임
async function changeGroupLeader(currentLeaderUSeq, gSeq, newLeaderUSeq) {
  try {
    if (currentLeaderUSeq === newLeaderUSeq) {
      return { success: false };
    }
    // 현재 모임의 모임장을 모임원으로 변경
    await GroupUser.update(
      { guIsLeader: null },
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
    console.error(error);
    return { success: false };
  }
}

// DELETE '/api/group/quit/:gSeq'
// 모임 탈퇴
exports.deleteQuitGroup = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token) {
      res.send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.send({
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
      res.send({
        success: false,
        msg: '모임 탈퇴 실패: 유저가 해당 모임에 속해있지 않습니다.',
      });
      return;
    }

    // Group 정보 있는지 한 번 더 확인
    const group = await Group.findByPk(gSeq);

    if (!group) {
      res.send({
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
        // 2명 이상 모임원이 있을 경우, 모임장 위임 / guIsLeader: null로 권한 모임원으로 업데이트
        // 모임장 위임 로직 호출
        const newLeaderUSeq = req.body.newLeaderUSeq;

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
              uSeq: uSeq,
              uEmail: uEmail,
              uName: uName,
            });
            return;
          } else {
            res.send({
              success: false,
              msg: '모임장 위임 실패',
            });
            return;
          }
        } else {
          res.send({
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
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
    });
    return;
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error(error);
    res.send({
      success: false,
      msg: '서버 에러',
    });
  }
};

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

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    const { gName, gDesc, gDday, gMaxMem, gCategory, missionArray } = req.body;

    // UUID 생성
    const uuid = uuidv4();

    // UUID를 Base64로 인코딩
    const base64 = Buffer.from(uuid, 'utf8').toString('base64');

    // 1) 모임 생성 → gSeq
    const insertOneGroup = await Group.create({
      gName, // 모임명
      gDesc, // 설명
      gDday, // 디데이
      gMaxMem, // 최대인원
      gCategory, // 카테고리
      gLink: base64,
    });

    // 2) 모임장을 모임 참여 유저에 추가
    if (insertOneGroup) {
      const insertOneGroupUser = await GroupUser.create({
        gSeq: insertOneGroup.gSeq,
        uSeq,
        guIsLeader: 'y',
      });

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

          Score.groupTotalScore(insertOneGroupUser.gSeq, 0, missionInfo.mLevel);

          mCnt++;
        }

        if (missionArray.length === mCnt) {
          res.status(200).send({
            isSuccess: true,
            msg: '모임 생성에 성공했습니다.',
            uSeq: uSeq,
            uEmail: uEmail,
            uName: uName,
          });
        } else {
          res.send({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
        }
      } else {
        res.send({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
      }
    } else {
      res.send({ isSuccess: false, msg: '모임 생성에 실패했습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// PATCH '/api/group'
// 모임 수정
exports.patchGroup = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

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
        res.status(200).send({
          isSuccess: true,
          msg: '모임 수정에 성공했습니다',
          uSeq: uSeq,
          uEmail: uEmail,
          uName: uName,
        });
      } else {
        res.send({ isSuccess: false, msg: '모임 수정에 실패했습니다' });
      }
    } else {
      res.send({ isSuccess: false, msg: '모임장이 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// PATCH '/api/group/groupCoverImg'
// 모임 커버 이미지 수정
exports.groupCoverImg = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (req.file.location) {
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
        res.status(200).send({
          isSuccess: true,
          msg: '모임 이미지 수정 완료',
          uSeq: uSeq,
          uEmail: uEmail,
          uName: uName,
        });
      } else {
        res.send({ isSuccess: false, msg: '모임장이 아닙니다.' });
      }
    } else {
      res.send({ isSuccess: false, msg: '이미지가 첨부되지 않았습니다' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
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
    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    const { gSeq } = req.body;

    // 1) 현재 삭제하는 사람이 모임장인지 확인
    const selectOneGroupUser = await GroupUser.findOne({
      where: {
        gSeq,
      },
    });

    // y = 모임장, null = 모임원
    if (selectOneGroupUser.guIsLeader) {
      // 2) 모임장을 포함한 모임 인원 확인 (2명 이상이면 모임장 위임 화면으로 이동)
      const countGroupUser = await GroupUser.count({
        where: {
          gSeq,
        },
      });

      // 모임원이 2명 이상이면 모임장 위임하는 화면으로 이동
      if (countGroupUser > 1) {
        res.send({ isSuccess: false, msg: '모임장 위임을 해야합니다.' });

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
          res.status(200).send({
            isSuccess: true,
            msg: '모임 삭제에 성공했습니다',
            uSeq: uSeq,
            uEmail: uEmail,
            uName: uName,
          });
        } else {
          res.send({ isSuccess: false, msg: '모임 삭제에 실패했습니다' });
        }
      }
    } else {
      res.send({ isSuccess: false, msg: '모임장이 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// 모임 페이지 load
exports.getGroupDetail = async (req, res) => {
  try {
    let groupSeq = req.params.gSeq;

    // 모임 정보
    const groupInfo = await Group.findOne({ where: { gSeq: groupSeq } });

    const { gName, gDesc, gDday, gMaxMem, gCategory, gCoverImg } = groupInfo;

    const groupDday = calculateDDay(gDday);

    const groupMission = await Mission.findAll({
      where: { gSeq: groupSeq, isExpired: { [Op.is]: null } },
    });

    const memberArray = await User.findAll({
      attributes: ['uSeq', 'uName', 'uImg', 'uCharImg'],
      include: [
        {
          model: GroupUser,
          where: { gSeq: groupSeq, guIsLeader: { [Op.is]: null } },
          attributes: ['guSeq'],
        },
      ],
    });

    const leaderInfo = await User.findOne({
      attributes: ['uSeq', 'uName', 'uImg', 'uCharImg'],
      include: [
        {
          model: GroupUser,
          where: { gSeq: groupSeq, guIsLeader: 'y' },
          attributes: ['guSeq'],
        },
      ],
    });

    const groupRanking = await ranking.groupRanking(groupSeq);

    const nowScoreUserInfo = groupRanking.nowRanking.map(
      (user) => user.tb_user
    );

    const nowRanking = groupRanking.nowRanking.map((item) => {
      return {
        uSeq: item.uSeq,
        guNowScore: item.guNowScore,
      };
    });

    const totalScoreUserInfo = groupRanking.totalRanking.map(
      (user) => user.tb_user
    );

    const totalRanking = groupRanking.totalRanking.map((item) => {
      return {
        uSeq: item.uSeq,
        guTotalScore: item.guTotalScore,
      };
    });

    const doneRates = groupRanking.doneRates;

    // 회원인 경우
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(' ')[1];
      const user = await jwt.verify(token);

      // 모임에 가입한 경우
      let isLeader;
      let isJoin;

      const groupUser = await GroupUser.findOne({
        attributes: ['guSeq', 'guIsLeader'],
        where: { gSeq: groupSeq, uSeq: user.uSeq },
      });

      if (groupUser) {
        isJoin = true;
        // 모임장여부 : true/false
        isLeader = groupUser && groupUser.guIsLeader === 'y' ? true : false;
      } else {
        // 모임 가입하지 않은 경우
        isJoin = false;
        isLeader = false;
      }

      res.send({
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
        memberArray,
        leaderInfo,
      });
      // 비회원인경우
    } else {
      res.send({
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
        memberArray,
        leaderInfo,
      });
    }
  } catch (err) {
    console.error(err);
    res.send({
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

    const userJoin = await GroupUser.create({
      gSeq: groupSeq,
      uSeq: user.uSeq,
    });
    // 참여 요청-알림-수락의 경우 레디스/웹소켓이 필요할것으로 생각됨
  } else {
    res.send({ result: false, message: '먼저 로그인 해주세요.' });
  }
};

// GET '/api/group/chat/:gSeq'
// 모임(별) 채팅
exports.getGroupChat = async (req, res) => {
  try {
    const connectedUser = {}; // 연결된 클라이언트를 저장할 객체
    const io = req.io;
    const { gSeq } = req.params;

    /////////////////////////////////////////////////////
    const connectedSockets = new Set();

    // 네임스페이스 생성
    const chatNamespace = io.of(`/api/group/chat`);

    // 네임스페이스에 이벤트 리스너 등록
    chatNamespace.on('connection', (socket) => {
      // 클라이언트 소켓의 고유한 ID를 가져옴
      const socketId = socket.id;

      console.log(`/api/group/chat 네임스페이스 연결 완료 ::: `, socketId);

      // 이미 연결된 소켓인지 확인
      if (connectedSockets.has(socketId)) {
        // 중복 연결이면 처리하지 않고 종료
        console.log(`Socket ${socketId} is already connected.`);
        return;
      }

      // 새로운 소켓을 연결된 소켓 목록에 추가
      connectedSockets.add(socketId);

      // 연결 이벤트 핸들러
      console.log(`Socket ${socketId} connected.`);

      // 다른 이벤트 핸들러 등록 가능

      // 연결이 끊어질 때 연결된 소켓 목록에서 제거
      socket.on('disconnect', () => {
        console.log(`/api/group/chat 접속 종료 ::: `, socket.id);
        console.log(`Socket ${socketId} disconnected.`);
        connectedSockets.delete(socketId);
      });
    });

    //////////////////////////////////////////////////

    // // 네임스페이스 생성
    // const chatNamespace = io.of(`/api/group/chat/${gSeq}`);

    // // 네임스페이스에 이벤트 리스너 등록
    // chatNamespace.on('connection', (socket) => {
    //   console.log(
    //     `/api/group/chat/${gSeq} 네임스페이스 연결 완료 ::: `,
    //     socket.id
    //   );

    //   socket.on('disconnect', () => {
    //     console.log(`/api/group/chat/${gSeq} 접속 종료 ::: `, socket.id);
    //   });

    //   // socket.on('login', (data) => {
    //   //   console.log('data ::::: ', data);
    //   //   const { uSeq, uName, gName, gSeq } = data;

    //   //   // 클라이언트에서 로그인 이벤트를 보내면, 연결을 저장하고 해당 연결을 사용
    //   //   if (!connectedUser[uSeq]) {
    //   //     connectedUser[uSeq] = socket.id;
    //   //     socket.name = uName;
    //   //     socket.roomName = gName;
    //   //     socket.roomNumber = gSeq;
    //   //     // 소켓에 들어오게 되면 자동으로 모임 채팅에 참여함
    //   //     socket.join(socket.roomNumber);
    //   //     console.log(socket.roomName, ' -- ', socket.roomNumber);
    //   //     console.log('연결된 유저 목록 ::::::', connectedUser);

    //   //   } else {
    //   //     // 이미 연결이 있는 경우, 기존 연결을 사용하고 새 연결을 닫음
    //   //     socket.disconnect();
    //   //   }
    //   // });

    //   // socket.on('chatMessage', (message) => {
    //   //   console.log(message);
    //   //   req.io
    //   //     .to(socket.roomNumber)
    //   //     .emit('message', `${socket.name} : ` + message); // 모든 클라이언트에 메시지를 전송
    //   // });
    // });

    // const { join } = require('node:path');
    // res.sendFile(join(__dirname, '/../public/chat.html'));
    res.render('chat');
  } catch (err) {
    console.error(err);
    res.send({ isSuccess: false, msg: 'error' });
  }
};

// getJoinLink
exports.getJoinLink = async (req, res) => {
  try {
    const gSeq = req.params.gSeq; // 어느 그룹을 탈퇴하려고 하는지 받아오기

    const groupLink = await Group.findOne({
      where: { gSeq },
      attributes: ['gLink'],
    });

    if (!groupLink) {
      res.send({
        success: false,
        msg: '링크가 존재하지 않습니다',
      });
      return;
    }

    // Group 정보 있는지 한 번 더 확인
    const group = await Group.findByPk(gSeq);

    if (!group) {
      res.send({
        success: false,
        msg: '모임 정보를 찾을 수 없습니다.',
      });
      return;
    }

    res.status(200).send({
      success: true,
      msg: '모임 링크 가져오기 성공',
      gLink: groupLink.gLink, // gLink을 응답에 포함
    });
    return;
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error(error);
    res.send({
      success: false,
      msg: '서버 에러',
    });
  }
};

exports.postJoinByLink = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token || !uSeq) {
      res.send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }
    const gLink = req.body.gLink;

    const group = await Group.findOne({ where: { gLink: gLink } });

    if (!group) {
      res.send({ success: false, msg: '모임을 찾을 수 없습니다.' });
      return;
    }

    // 사용자가 이미 해당 그룹에 속해 있는지 확인
    const alreadyJoined = await GroupUser.findOne({
      where: { gSeq: group.gSeq, uSeq: uSeq },
    });

    if (alreadyJoined) {
      res.send({
        success: false,
        msg: '사용자는 이미 그룹에 속해 있습니다.',
      });
      return;
    }

    // 사용자를 그룹에 추가
    const result = await GroupUser.create({
      gSeq: group.gSeq,
      uSeq: uSeq,
      guIsLeader: null, // 사용자가 모임장이 아님
    });

    if (result) {
      res.status(200).send({
        success: true,
        msg: '모임 참여에 성공했습니다.',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    } else {
      res.send({ success: false, msg: '모임 참여에 실패했습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ success: false, msg: 'error' });
  }
};

exports.postJoin = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    if (!token || !uSeq) {
      res.send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    const gSeq = req.body.gSeq;

    const group = await Group.findOne({ where: { gSeq: gSeq } });

    if (!group) {
      res.send({ success: false, msg: '모임을 찾을 수 없습니다.' });
      return;
    }

    // 사용자가 이미 해당 그룹에 속해 있는지 확인
    const alreadyJoined = await GroupUser.findOne({
      where: { gSeq: gSeq, uSeq: uSeq },
    });

    if (alreadyJoined) {
      res.send({
        success: false,
        msg: '사용자는 이미 그룹에 속해 있습니다.',
      });
      return;
    }

    // 사용자를 그룹에 추가
    const result = await GroupUser.create({
      gSeq: gSeq,
      uSeq: uSeq,
    });

    if (result) {
      res.status(200).send({
        success: true,
        msg: '모임 참여에 성공했습니다.',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    } else {
      res.send({ success: false, msg: '모임 참여에 실패했습니다.' });
    }
  } catch (err) {
    console.error(err);
    res.send({ success: false, msg: 'error' });
  }
};

// PATCH '/api/group/leader/:gSeq'
// 모임장 위임
exports.patchLeader = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;

    if (!token) {
      res.send({
        success: false,
        msg: '토큰 X',
      });
    }
    if (!uSeq) {
      res.send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    const { gSeq } = req.params;

    // 1) Group 정보 있는지 확인
    const group = await Group.findByPk(gSeq);

    if (!group) {
      res.send({
        success: false,
        msg: '모임 정보를 찾을 수 없습니다.',
      });
      return;
    }

    // 2) 실제 모임장인지 확인
    const isLeader = await GroupUser.findOne({
      where: { uSeq, gSeq, guIsLeader: { [Op.eq]: 'y' } },
    });

    if (!isLeader) {
      res.send({
        success: false,
        msg: '모임장 위임 실패: 유저가 해당 모임의 모임장이 아닙니다.',
      });
      return;
    }

    // 모임장 본인의 guIsLeader 값을 null로 수정하고
    // 모임장으로 위임할 유저의 guIsLeader 값을 y로 수정
    const newLeaderUSeq = req.body.newLeaderUSeq;

    if (newLeaderUSeq) {
      const changeLeaderResult = await changeGroupLeader(
        uSeq,
        gSeq,
        newLeaderUSeq
      );

      if (changeLeaderResult.success) {
        res.status(200).send({
          success: true,
          msg: '모임장 위임 성공',
        });
        return;
      } else {
        res.send({
          success: false,
          msg: '모임장 위임 실패',
        });
        return;
      }
    } else {
      res.send({
        success: false,
        msg: '모임장 위임을 할 유저의 시퀀스가 필요합니다.',
      });
      return;
    }
  } catch (error) {
    // 기타 데이터베이스 오류
    console.error(error);
    res.send({
      success: false,
      msg: '서버 에러',
    });
  }
};
