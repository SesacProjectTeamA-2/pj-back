const socketIo = require('socket.io');

module.exports = (server) => {
  // socket.io 옵션
  const options = {
    cors: {
      // 신뢰할 수 있는 사이트 등록
      origin: [
        `${process.env.SERVER_DEV_URL}:${process.env.FRONT_DEV_PORT}`, // 로컬
        `${process.env.SERVER_PROD_DOMAIN}:${process.env.FRONT_PROD_PORT}`, // 배포
      ],
      methods: ['GET', 'POST'],
    },
  };

  const io = socketIo(server, options);
  io.on('connection', (socket) => {
    // "chat message" 리스너로 들어온 이벤트를 받는다.
    // msg value는 클라이언트에서 "chat message"이벤트로 송신한 값
    socket.on('chat message', (msg) => {
      // 클라이언트에서 들어온 msg를 io 객체에 보낸다.
      io.emit('chat message', msg);
    });
  });
};
