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

// 그룹의 공지 게시판
exports.getGroupNotiBoard = async (req, res) => {
  //   const gSeq = req.query.gSeq; // 클라이언트에서 보낸 gSeq
  const gSeq = req.params.gSeq;
  const category = 'notice';

  console.log(gSeq, category);
  console.log(req.params); // gSeq값

  const groupInfo = await GroupBoard.findAll({
    where: { gSeq: gSeq, gbCategory: category },
  });

  res.json(groupInfo);
};

// 그룹의 공지 게시글 디테알
exports.getGroupNotiDetail = async (req, res) => {
  const gSeq = req.params.gSeq;
  const category = 'notice'; // 'notice' 카테고리
  const gbSeq = req.params.gbSeq; // 게시글 고유 식별자

  console.log(gSeq, '그룹의', gbSeq, '번째 글, 카테고리는', category);
  console.log(req.params); // gSeq값

  // gSeq 및 category로 공지사항 게시글 필터링
  const groupInfo = await GroupBoard.findOne({
    where: { gSeq: gSeq, gbCategory: category, gbSeq: gbSeq },
  });

  if (groupInfo) {
    // 게시글을 찾았을 경우
    res.status(200).json(groupInfo);
  } else {
    // 게시글을 찾지 못했을 경우
    res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
};

// 그룹의 자유 게시판
exports.getGroupFreeBoard = async (req, res) => {
  const gSeq = req.params.gSeq;
  const category = 'free';

  console.log(gSeq, category);
  console.log(req.params); // gSeq값

  const groupInfo = await GroupBoard.findAll({
    where: { gSeq: gSeq, gbCategory: category },
  });

  res.json(groupInfo);
};

// 그룹의 자유 게시글 디테알
exports.getGroupFreeDetail = async (req, res) => {
  const gSeq = req.params.gSeq;
  const category = 'free'; // 'free' 카테고리
  const gbSeq = req.params.gbSeq; // 게시글 고유 식별자

  console.log(gSeq, '그룹의', gbSeq, '번째 글, 카테고리는', category);
  console.log(req.params); // gSeq값

  // gSeq 및 category로 공지사항 게시글 필터링
  const groupInfo = await GroupBoard.findOne({
    where: { gSeq: gSeq, gbCategory: category, gbSeq: gbSeq },
  });

  if (groupInfo) {
    // 게시글을 찾았을 경우
    res.status(200).json(groupInfo);
  } else {
    // 게시글을 찾지 못했을 경우
    res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
  }
};

// 그룹의 미션 게시판
exports.getGroupMissionBoard = async (req, res) => {
  const gSeq = req.params.gSeq;
  const category = 'mission';
  const mSeq = req.query.mSeq; // 클라이언트에서 요청 보낼때 query로 mSeq 값 넣어서 보내주기

  console.log(gSeq, category, mSeq);

  const groupInfo = await GroupBoard.findAll({
    where: { gSeq: gSeq, gbCategory: category, mSeq: mSeq },
  });

  res.json(groupInfo);
};

// 새 게시글 생성 페이지 렌더링
// /board/create
exports.getCreateBoard = async (req, res) => {
  let token = req.headers.authorization.split(' ')[1];
  const user = await jwt.verify(token);
  console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

  const uSeq = user.uSeq;
  console.log(uSeq);

  // // 클라이언트에서 요청 보낼때 query로 mSeq, gSeq, category 값 넣어서 보내주기
  // const mSeq = req.query.mSeq;
  // const gSeq = req.query.gSeq;
  // const category = req.query.category;

  try {
    if (!uSeq) {
      res.status(401).send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }

    res.status(200).send({
      success: true,
      msg: '게시글 생성 페이지 로딩 성공',
      data: {
        user: uSeq,
      },
    });
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버에러 발생',
    });
  }
};

// 새 게시글 생성 페이지 요청
// /board/create
exports.createBoard = async (req, res) => {
  //   authUtil.checkToken();
  let token = req.headers.authorization.split(' ')[1];
  //   console.log('=========', req.headers, token);
  const user = await jwt.verify(token);
  console.log('디코딩 된 토큰!!!!!!!!!!! :', user);

  const uSeq = user.uSeq;
  console.log(uSeq);

  // 클라이언트에서 요청 보낼때 query로 mSeq, gSeq, category 값 넣어서 보내주기
  const gSeq = req.query.gSeq;
  const category = req.query.category;

  try {
    console.log('gSeq : ', gSeq);
    if (!uSeq) {
      res.status(401).send({
        success: false,
        msg: '로그인X or 비정상적인 접근',
      });
      return;
    }
    // 모임원인지 아닌지 guSeq 확인
    const groupUser = await GroupUser.findOne({
      where: { uSeq: uSeq },
    });
    const guSeq = groupUser.guSeq;
    console.log('uSeq의 guSeq : ', guSeq);

    if (!groupUser) {
      res.status(402).send({
        success: false,
        msg: '그룹에 참여한 유저 X or 비정상적인 접근',
      });
    }

    if (category == 'mission') {
      const mSeq = req.query.mSeq;

      // 미션이면 미션의 mSeq 있어야함
      const newBoard = await GroupBoard.create({
        gbTitle: req.body.gbTitle,
        gbContent: req.body.gbContent,
        gbCategory: req.query.category,
        mSeq: mSeq,
        gSeq: gSeq,
        uSeq: uSeq,
        guSeq: guSeq,
      });
      res.status(200).send({
        success: true,
        msg: '게시글 (미션) 생성 처리 성공',
        gbSeq: newBoard.dataValues.gbSeq,
        data: {
          user: uSeq,
          gbSeq: newBoard.dataValues.gbSeq,
        },
      });
    } else if (category === 'notice' || category === 'free') {
      // DB작업
      const newBoard = await GroupBoard.create({
        gbTitle: req.body.gbTitle,
        gbContent: req.body.gbContent,
        gbCategory: req.query.category,
        gSeq: gSeq,
        uSeq: uSeq,
        guSeq: guSeq,
      });
      res.status(200).send({
        success: true,
        msg: '게시글 (공지, 자유) 생성 처리 성공',
        gbSeq: newBoard.dataValues.gbSeq,
        data: {
          user: uSeq,
          gbSeq: newBoard.dataValues.gbSeq,
        },
      });
    } else {
      res.status(400).send({
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
