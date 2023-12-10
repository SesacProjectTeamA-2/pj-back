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

// GET '/api/socket/chat
// 모임 채팅 목록
exports.getGroupChats = async (req, res) => {
  try {
    // const token = req.headers.authorization.split(' ')[1];
    // if (!token) {
    //   res.send({
    //     success: false,
    //     msg: '토큰 X',
    //   });
    // }
    // if (!uSeq) {
    //   res.send({
    //     success: false,
    //     msg: '로그인X or 비정상적인 접근',
    //   });
    //   return;
    // }

    // const user = await jwt.verify(token);
    // const uSeq = user.uSeq;
    // const userInfo = await User.findOne({
    //   where: { uSeq },
    // });
    // const { uName } = userInfo;

    // const gSeqs = await GroupUser.findAll({
    //   where: { uSeq },
    // });

    // 1. 유저 로그인 : 유저 토큰 - uSeq로 가입된 모임에 모두 입장!
    // 2. 해당 모임 클릭시 : gSeq - 모임별 채팅방 대화 목록.
    // 3. 유저 로그아웃 : 모임 채팅방에서 disconnect

    const connectedUser = {}; // 연결된 클라이언트를 저장할 객체
    const io = req.io;

    // Set 객체생성 : 중복된 값을 허용하지 않는 데이터 구조.
    const connectedSockets = new Set();

    // 네임스페이스 생성(모임챗) - 룸: 각 모임별 챗
    // Express의 라우팅처럼 url에 지정된 위치에 따라 신호의 처리를 다르게 하는 기술(특정 페이지에서 소켓이 보내주는 모든 실시간 메세지를 받을 필요는 없다)
    // Room은 namespace의 하위개념에 해당.(카톡 단톡방 1, 단톡방 2...)
    const groupChat = io.of(`/api/socket/chat`);

    // 네임스페이스에 이벤트 리스너 등록
    groupChat.on('connection', (socket) => {
      // 클라이언트 소켓의 고유한 ID를 가져옴
      const socketId = socket.id;
      console.log(socket);
      console.log(`/api/socket/chat 네임스페이스 연결 완료 ::: `, socketId);

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

      const rooms = ['room1', 'room2', 'room3'];

      // 다른 이벤트 핸들러 등록 가능
      // 각 모임방에 notice + 입장
      io.emit('login', () => {
        console.log(`${socketId}가 로그인하셨습니다.`);
      });

      rooms.forEach((room) => {
        socket.join(room);
      });

      // 연결이 끊어질 때 연결된 소켓 목록에서 제거
      // 각 모임방에 notice
      socket.on('disconnect', () => {
        console.log(`Socket ${socketId} disconnected.`);
        io.emit('notice', `${socketId}님이 로그아웃하셨습니다.`);
        connectedSockets.delete(socketId);
      });
    });

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
