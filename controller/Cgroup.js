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
const jwt = require('../modules/jwt');

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

    const {
      gName,
      gDesc,
      gDday,
      gMaxMem,
      gCategory,
      gCoverImg,
      mTitle,
      mContent,
      mLevel,
    } = req.body;

    // 1) 모임 생성 → gSeq
    const insertOneGroup = await Group.create({
      gName, // 모임명
      gDesc, // 설명
      gDday, // 디데이
      gMaxMem, // 최대인원
      gCategory, // 카테고리
      gCoverImg, // 커버 이미지
    });

    // 2) 모임장을 모임 참여 유저에 추가
    if (insertOneGroup) {
      const insertOneGroupUser = await GroupUser.create({
        gSeq: insertOneGroup.gSeq,
        uSeq,
        guIsLeader: 'y',
      });

      // 3) 모임 생성 화면에서 등록한 미션 등록
      if (insertOneGroupUser) {
        const insertOneMission = await Mission.create({
          gSeq: insertOneGroup.gSeq,
          mTitle, // 미션 제목
          mContent, // 미션 내용
          mLevel, // 난이도 (상: 5점, 중: 3점, 하: 1점)
        });
        if (insertOneMission) {
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
