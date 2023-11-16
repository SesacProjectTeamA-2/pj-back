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

// 댓글 생성 처리
// /comment/create/:gbSeq
exports.createComment = async (req, res) => {
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

    const groupUser = await GroupUser.findOne({
      where: { uSeq: uSeq },
    });

    if (!groupUser) {
      res.send({
        success: false,
        msg: 'groupuser에서 해당 uSeq의 guSeq를 찾을 수 없음',
      });
      return;
    }

    const guSeq = groupUser.guSeq;

    // Req 데이터 Null 검사
    if (!req.body.gbcContent || !req.params.gbSeq) {
      res.send({
        success: false,
        msg: 'gbcContent가 빈 값이거나 gbSeq를 찾을 수 없음',
      });
      return;
    }

    // 댓글이 달릴 게시글 = gbSeq
    const gbSeq = req.params.gbSeq;
    if (!gbSeq) {
      res.send({
        success: false,
        msg: 'gbSeq 값을 찾을 수 없음',
      });
      return;
    }

    // gbSeq가 DB에 있는지 확인
    const groupBoard = await GroupBoard.findByPk(gbSeq);
    if (!groupBoard) {
      res.send({
        success: false,
        msg: '존재하지 않는 gbSeq',
      });
      return;
    }
    const gbcContent = req.body.gbcContent;

    const newComment = await GroupBoardComment.create({
      gbSeq: gbSeq,
      gbcContent: gbcContent,
      guSeq: guSeq,
    });

    // 정상 처리
    res.status(200).send({
      success: true,
      msg: '게시글 댓글 생성 처리 성공',
      uSeq: uSeq,
      uEmail: uEmail,
      uName: uName,
      gbcContent: gbcContent,
    });
    return;
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '데이터베이스 오류 발생',
    });
    return;
  }
};

// 댓글 수정 시 변경 여부 확인용
const hasChanged = (beforeEdit, afterEdit) =>
  beforeEdit.gcbContent !== afterEdit.gbcContent;

// 댓글 수정 요청
// /comment/edit/:gbcSeq
exports.editComment = async (req, res) => {
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
    const gbcSeq = req.params.gbcSeq;
    // 업데이트 전 게시글 데이터 조회
    const beforeEdit = await GroupBoardComment.findByPk(gbcSeq);

    // Check if the comment to be edited exists
    if (!beforeEdit) {
      res.send({
        success: false,
        msg: '수정할 댓글을 찾을 수 없음',
      });
      return;
    }

    const groupUser = await GroupUser.findOne({
      where: { uSeq: uSeq },
    });

    if (!groupUser) {
      res.send({
        success: false,
        msg: 'groupuser에서 해당 uSeq의 guSeq를 찾을 수 없음',
      });
      return;
    }

    // uSeq로 게시글 소유자 여부 확인(권한 확인)
    if (beforeEdit.dataValues.guSeq !== uSeq) {
      res.send({
        success: false,
        msg: '게시글의 소유자가 아님',
      });
      return;
    }
    const { gbcContent } = req.body;

    let result = await GroupBoardComment.update(
      {
        gbcContent: gbcContent,
      },
      {
        where: { gbcSeq: gbcSeq },
      }
    );

    // 업데이트 후 데이터 조회
    const afterEdit = await GroupBoardComment.findByPk(gbcSeq);

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
      msg: 'comment 업데이트 처리 성공',
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

// 댓글 삭제 처리
// /comment/delete/:gbcSeq
exports.deleteComment = async (req, res) => {
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
    const gbcSeq = req.params.gbcSeq;

    console.log('삭제하려는 gbcSeq : ', gbcSeq);

    const groupUser = await GroupUser.findOne({
      where: { uSeq: uSeq },
    });

    if (!groupUser) {
      res.send({
        success: false,
        msg: 'groupuser에서 해당 uSeq의 guSeq를 찾을 수 없음',
      });
      return;
    }

    const guSeq = groupUser.guSeq;

    const isDeleted = await GroupBoardComment.destroy({
      where: {
        gbcSeq: gbcSeq,
        guSeq: guSeq,
      },
    });

    if (!isDeleted) {
      // 삭제 실패 처리
      res.send({
        success: false,
        msg: '댓글이 삭제되지 않았습니다.',
      });
      return;
    } else {
      // 정상 삭제 처리
      res.status(200).send({
        success: true,
        msg: '댓글이 정상적으로 삭제되었습니다.',
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
      msg: '댓글 삭제처리 중 서버에러 발생',
    });
  }
};
