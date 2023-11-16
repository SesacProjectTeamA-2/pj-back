const { secretKey } = require('../config/secretkey');
const {
  User,
  Group,
  GroupUser,
  GroupBoard,
  GroupBoardComment,
  GroupBoardIcon,
  Mission,
} = require('../models');
// 로그인 된 사용자인지 아닌지 판별하려면 불러와야함
const jwt = require('../modules/jwt');
const authUtil = require('../middlewares/auth');
const { token } = require('morgan');
const score = require('../modules/rankSystem');

// 그룹의 공지 게시판
exports.getGroupNotiBoard = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'notice';

    console.log(gSeq, category);

    const groupInfo = await GroupBoard.findAll({
      where: { gSeq, gbCategory: category },
      include: [
        {
          model: GroupBoardComment,
          attributes: ['gbSeq'],
        },
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
      ],
      attributes: {
        exclude: ['tb_groupBoardComments'], // 'tb_groupBoardComments' 필드 제외->반복제거
      },
    });

    // groupInfo에 대한 댓글 수 가져오기
    for (const group of groupInfo) {
      const gbSeq = group.gbSeq;
      const commentVal = await GroupBoardComment.findAndCountAll({
        where: { gbSeq },
      });
      group.dataValues.commentCount = commentVal.count;
      delete group.dataValues.tb_groupBoardComments;
    }

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch {
    res.send({
      success: false,
      msg: 'db 에러',
    });
  }
};

// 그룹의 공지 게시글 디테알
exports.getGroupNotiDetail = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'notice'; // 'notice' 카테고리
    const gbSeq = req.params.gbSeq; // 게시글 고유 식별자

    console.log(gSeq, '그룹의', gbSeq, '번째 글, 카테고리는', category);

    // gSeq 및 category로 공지사항 게시글 필터링
    const groupInfo = await GroupBoard.findOne({
      where: { gSeq: gSeq, gbCategory: category, gbSeq: gbSeq },
      include: [
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
        {
          model: GroupBoardComment,
          attributes: ['gbcSeq', 'gbcContent'],
          include: [
            {
              model: GroupUser,
              attributes: ['guSeq'],
              include: [
                {
                  model: User,
                  attributes: ['uName', 'uImg'],
                },
              ],
            },
          ],
          // include: [
          //   {
          //     model: GroupBoard, // 댓글 작성자 정보 가져오기
          //     attributes: ['gbSeq'],
          //     include: [
          //       {
          //         model: GroupUser,
          //         attributes: ['guSeq'],
          //         include: [
          //           {
          //             model: User,
          //             attributes: ['uName', 'uImg'],
          //           },
          //         ],
          //       },
          //     ],
          //   },
          // ],
        },
      ],
    });
    console.log('groupInfo:', groupInfo);

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch (error) {
    console.error('에러 발생:', error);

    res.send({
      success: false,
      msg: 'gSeq 혹은 gbSeq를 찾을 수 없습니다.',
    });
  }
};

// 그룹의 자유 게시판
exports.getGroupFreeBoard = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'free';

    const groupInfo = await GroupBoard.findAll({
      where: { gSeq, gbCategory: category },
      include: [
        {
          model: GroupBoardComment,
          attributes: ['gbSeq'],
        },
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
      ],
      attributes: {
        exclude: ['tb_groupBoardComments'], // 'tb_groupBoardComments' 필드 제외->반복제거
      },
    });

    // groupInfo에 대한 댓글 수 가져오기
    for (const group of groupInfo) {
      const gbSeq = group.gbSeq;
      const commentVal = await GroupBoardComment.findAndCountAll({
        where: { gbSeq },
      });
      group.dataValues.commentCount = commentVal.count;
      delete group.dataValues.tb_groupBoardComments;
    }

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch {
    res.send({
      success: false,
      msg: 'gSeq를 찾을 수 없습니다.',
    });
  }
};

// 그룹의 자유 게시글 디테알
exports.getGroupFreeDetail = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'free'; // 'free' 카테고리
    const gbSeq = req.params.gbSeq; // 게시글 고유 식별자

    console.log(gSeq, '그룹의', gbSeq, '번째 글, 카테고리는', category);

    // gSeq 및 category로 공지사항 게시글 필터링
    const groupInfo = await GroupBoard.findOne({
      where: { gSeq: gSeq, gbCategory: category, gbSeq: gbSeq },
      include: [
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
        {
          model: GroupBoardComment,
          attributes: ['gbcSeq', 'gbcContent'],
          include: [
            {
              model: GroupUser,
              attributes: ['guSeq'],
              include: [
                {
                  model: User,
                  attributes: ['uName', 'uImg'],
                },
              ],
            },
          ],
          // include: [
          //   {
          //     model: GroupBoard, // 댓글 작성자 정보 가져오기
          //     attributes: ['gbSeq'],
          //     include: [
          //       {
          //         model: GroupUser,
          //         attributes: ['guSeq'],
          //         include: [
          //           {
          //             model: User,
          //             attributes: ['uName', 'uImg'],
          //           },
          //         ],
          //       },
          //     ],
          //   },
          // ],
        },
      ],
    });

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch {
    res.send({
      success: false,
      msg: 'gSeq 혹은 gbSeq 를 찾을 수 없습니다.',
    });
  }
};

// 그룹의 미션 게시판
exports.getGroupMissionBoard = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'mission';
    const mSeq = req.params.mSeq; // 클라이언트에서 요청 보낼때 query로 mSeq 값 넣어서 보내주기

    console.log(gSeq, category, mSeq);

    const groupInfo = await GroupBoard.findAll({
      where: { gSeq: gSeq, gbCategory: category, mSeq: mSeq },
      include: [
        {
          model: GroupBoardComment,
          attributes: ['gbSeq'],
        },
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
      ],
      attributes: {
        exclude: ['tb_groupBoardComments'], // 'tb_groupBoardComments' 필드 제외->반복제거
      },
    });

    // groupInfo에 대한 댓글 수 가져오기
    for (const group of groupInfo) {
      const gbSeq = group.gbSeq;
      const commentVal = await GroupBoardComment.findAndCountAll({
        where: { gbSeq },
      });
      group.dataValues.commentCount = commentVal.count;
      delete group.dataValues.tb_groupBoardComments;
    }

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch {
    res.send({
      success: false,
      msg: 'gSeq 혹은 mSeq를 찾을 수 없습니다.',
    });
  }
};

// 그룹의 미션 게시글 상세
exports.getGroupMissionDetail = async (req, res) => {
  try {
    const gSeq = req.params.gSeq;
    const category = 'mission';
    const mSeq = req.params.mSeq;
    const gbSeq = req.params.gbSeq;

    console.log('getGroupMissionDetail : ', gSeq, category, mSeq, gbSeq);

    // const groupInfo = await GroupBoard.findOne({
    //   where: { gSeq: gSeq, gbCategory: category, mSeq: mSeq, gbSeq: gbSeq },
    //   include: [GroupBoardComment], // 댓글 배열형태로 가져오기
    // });
    // gSeq 및 category로 공지사항 게시글 필터링
    const groupInfo = await GroupBoard.findOne({
      where: { gSeq: gSeq, gbCategory: category, mSeq: mSeq, gbSeq: gbSeq },
      include: [
        {
          model: GroupUser,
          attributes: ['guSeq'],
          include: [
            {
              model: User,
              attributes: ['uName', 'uImg'],
            },
          ],
        },
        {
          model: GroupBoardComment,
          attributes: ['gbcSeq', 'gbcContent'],
          include: [
            {
              model: GroupUser,
              attributes: ['guSeq'],
              include: [
                {
                  model: User,
                  attributes: ['uName', 'uImg'],
                },
              ],
            },
          ],
          // include: [
          //   {
          //     model: GroupBoard, // 댓글 작성자 정보 가져오기
          //     attributes: ['gbSeq'],
          //     include: [
          //       {
          //         model: GroupUser,
          //         attributes: ['guSeq'],
          //         include: [
          //           {
          //             model: User,
          //             attributes: ['uName', 'uImg'],
          //           },
          //         ],
          //       },
          //     ],
          //   },
          // ],
        },
      ],
    });

    if (groupInfo) {
      // 게시글을 찾았을 경우
      res.status(200).send({
        success: true,
        msg: '게시글 조회 성공',
        groupInfo,
      });
    } else {
      // 게시글을 찾지 못했을 경우
      res.send({
        success: false,
        msg: '게시글을 찾을 수 없습니다.',
      });
    }
  } catch {
    res.send({
      success: false,
      msg: 'gSeq 혹은 mSeq를 찾을 수 없습니다.',
    });
  }
};

// 새 게시글 생성 페이지 렌더링
// /board/create
exports.getCreateBoard = async (req, res) => {
  // let token = req.headers.authorization.split(' ')[1];
  // const user = await jwt.verify(token);
  // console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

  // const uSeq = user.uSeq;
  // console.log(uSeq);

  // // 클라이언트에서 요청 보낼때 query로 mSeq, gSeq, category 값 넣어서 보내주기
  // const mSeq = req.query.mSeq;
  // const gSeq = req.query.gSeq;
  // const category = req.query.category;

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

    res.status(200).send({
      success: true,
      msg: '게시글 조회 성공',
      groupInfo,
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
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

// 새 게시글 생성 요청
// /board/create
exports.createBoard = async (req, res) => {
  try {
    let token = req.headers.authorization.split(' ')[1];
    const user = await jwt.verify(token);

    const uSeq = user.uSeq;
    const uEmail = user.uEmail;
    const uName = user.uName;

    // 클라이언트에서 요청 보낼때 body로 mSeq, gSeq, gbCategory 값 넣어서 보내주기
    const gSeq = req.body.gSeq;
    const gbCategory = req.body.gbCategory;

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

    console.log('gSeq : ', gSeq);

    // 모임원인지 아닌지 guSeq 확인
    const groupUser = await GroupUser.findOne({
      where: { uSeq: uSeq, gSeq: gSeq },
    });

    if (!groupUser) {
      res.send({
        success: false,
        msg: '그룹에 참여한 유저 X or 비정상적인 접근',
      });
      return;
    }
    const guSeq = groupUser.guSeq;
    console.log('uSeq의 guSeq : ', guSeq);

    if (gbCategory == 'mission') {
      const mSeq = req.body.mSeq;

      const cal = 'add';

      score.currentScore(guSeq, mSeq, cal);
      // 미션이면 미션의 mSeq 있어야함
      const newBoard = await GroupBoard.create({
        gbTitle: req.body.gbTitle,
        gbContent: req.body.gbContent,
        gbCategory: req.body.gbCategory,
        mSeq: req.body.mSeq,
        gSeq: req.body.gSeq,
        uSeq: uSeq,
        guSeq: guSeq,
      });

      res.status(200).send({
        success: true,
        msg: '게시글 (미션) 생성 처리 성공',
        gbSeq: newBoard.dataValues.gbSeq,

        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    } else if (gbCategory === 'notice' || gbCategory === 'free') {
      // DB작업
      const newBoard = await GroupBoard.create({
        gbTitle: req.body.gbTitle,
        gbContent: req.body.gbContent,
        gbCategory: req.body.gbCategory,
        gSeq: req.body.gSeq,
        uSeq: uSeq,
        guSeq: guSeq,
      });
      res.status(200).send({
        success: true,
        msg: '게시글 (공지, 자유) 생성 처리 성공',
        gbSeq: newBoard.dataValues.gbSeq,
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    } else {
      res.send({
        success: false,
        msg: '올바르지 않은 카테고리 값입니다.',
      });
    }
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버에러 발생',
    });
  }
};

// 게시글 수정 시 변경 여부 확인용
const hasChanged = (beforeEdit, afterEdit) =>
  beforeEdit.gbTitle !== afterEdit.gbTitle ||
  beforeEdit.gbContent !== afterEdit.gbContent;

// 게시글 수정 페이지 렌더링
// /board/edit/:gbSeq
exports.getEditBoard = async (req, res) => {
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

    // 업데이트 전 게시글 데이터 조회
    const gbSeq = req.params.gbSeq;

    const beforeEdit = await GroupBoard.findByPk(gbSeq);

    // uSeq로 게시글 소유자 여부 확인(권한 확인)
    if (beforeEdit.dataValues.uSeq !== uSeq) {
      res.send({
        success: false,
        msg: '게시글의 소유자가 아님',
      });
      return;
    } else {
      const writerUser = await GroupBoard.findOne({
        where: { uSeq: uSeq, gbSeq: gbSeq },
      });

      // 정상 처리
      res.status(200).send({
        success: true,
        userData: writerUser,
        msg: '페이지 렌더링 정상 처리',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    }
  } catch (error) {
    // 에러 처리
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버 에러 발생',
    });
  }
};

// 게시글 수정 요청
// /board/edit/:gbSeq
exports.editBoard = async (req, res) => {
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
    // 업데이트 전 게시글 데이터 조회
    const gbSeq = req.params.gbSeq;
    // 업데이트 전 게시글 데이터 조회
    const beforeEdit = await GroupBoard.findByPk(gbSeq);

    // uSeq로 게시글 소유자 여부 확인(권한 확인)
    if (beforeEdit.dataValues.uSeq !== uSeq) {
      res.send({
        success: false,
        msg: '게시글의 소유자가 아님',
      });
      return;
    }
    const { gbTitle, gbContent } = req.body;

    let result = await GroupBoard.update(
      {
        gbTitle: gbTitle,
        gbContent: gbContent,
      },
      {
        where: { gbSeq: gbSeq },
      }
    );

    // 업데이트 후 데이터 조회
    const afterEdit = await GroupBoard.findByPk(gbSeq);

    // 업데이트 전과 후의 실제 데이터 변경 여부 확인
    const hasChangedResult = hasChanged(
      beforeEdit.dataValues,
      afterEdit.dataValues
    );
    isUpdated = hasChangedResult ? true : false;

    // 정상 처리
    res.status(200).send({
      success: true,
      isUpdated,
      result,
      msg: '게시글 업데이트 처리 성공',
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
    });
  } catch (error) {
    // 에러 처리
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버 에러 발생',
    });
  }
};

// 게시글 삭제 처리
// /board/delete/:gbSeq
exports.deleteBoard = async (req, res) => {
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
    const gbSeq = req.params.gbSeq;
    console.log('삭제하려는 gbSeq : ', gbSeq);

    const boardInfo = await GroupBoard.findOne({
      where: { gbSeq, uSeq },
      attributes: ['mSeq', 'gbIsDone', 'guSeq'],
    });

    const isDeleted = await GroupBoard.destroy({
      where: {
        gbSeq: gbSeq,
        uSeq: uSeq,
      },
    });

    // 미션글일경우 - 현재점수하락(게시글이 여러개일경우처리는 rankSystem 내재)
    if (boardInfo.mSeq) {
      const cal = 'del';
      score.currentScore(boardInfo.guSeq, boardInfo.mSeq, cal);
    }

    if (!isDeleted) {
      // 삭제 실패 처리
      res.send({
        success: false,
        msg: '게시글이 삭제되지 않았습니다.',
      });
      return;
    } else {
      // 정상 삭제 처리
      res.status(200).send({
        success: true,
        msg: '게시글이 정상적으로 삭제되었습니다.',
        uSeq: uSeq,
        uEmail: uEmail,
        uName: uName,
      });
    }
  } catch (error) {
    console.log(error);
    // 에러 처리
    res.status(500).send({
      success: false,
      msg: '게시글 삭제처리 중 서버에러 발생',
    });
  }
};
