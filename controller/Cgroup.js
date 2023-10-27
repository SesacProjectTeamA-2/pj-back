const {
  User,
  Group,
  GroupUser,
  GroupBoard,
  GroupBoardComment,
  GroupBoardIcon,
  Mission,
} = require('../models');

// POST '/api/group'
// 모임 생성
exports.postGroup = async (req, res) => {
  // [3가지 로직을 구현]
  // 1) 모임 생성 → gSeq
  // 2) 모임장을 모임 참여 유저에 추가
  // 3) 모임 생성 화면에서 등록한 미션 등록
  try {
    const {
      gName,
      gDesc,
      gDday,
      gMaxMem,
      gCategory,
      gCoverImg,
      mTitle,
      mContent,
    } = req.body;

    // 1) 모임 생성 → gSeq
    const insertOneGroup = await Group.create({
      gName,
      gDesc,
      gDday,
      gMaxMem,
      gCategory,
      gCoverImg,
    });

    // 2) 모임장을 모임 참여 유저에 추가
    if (insertOneGroup) {
      const insertOneGroupUser = await GroupUser.create({
        gSeq: insertOneGroup.gSeq,
        // uSeq, // 추후 jwt를 이용해서 값 받아온 다음, 진행해야함
        guIsLeader: 'y',
      });

      // 3) 모임 생성 화면에서 등록한 미션 등록
      if (insertOneGroupUser) {
        const insertOneMission = await Mission.create({
          gSeq: insertOneGroup.gSeq,
          mTitle,
          mContent,
        });
        if (insertOneMission) {
          res.send({ isSuccess: true, msg: '모임 생성에 성공했습니다.' });
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
    res.send({ isSuccess: false, msg: 'error' });
  }
};
