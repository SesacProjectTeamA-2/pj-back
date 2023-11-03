console.log('');

cron.schedule('1 0 * * *', async () => {
  console.log(
    '1. 누적 점수 업데이트!!!! 2. 미션만료!!! 3. 모임 미션 점수 초기화!!!'
  );

  try {
    // 현재 날짜를 얻기
    const currentDate = new Date();

    // 현재 날짜에서 하루를 빼서 이전 날짜를 계산
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);

    // 미션 만료된 모임 추출
    const Groups = await Group.findAll({
      where: {
        gDday: {
          [Op.gte]: previousDate.toISOString().slice(0, 10), // 이전 날짜 이후인 경우
          [Op.lte]: currentDate.toISOString().slice(0, 10), // 현재 날짜 이전인 경우
        },
      },
      include: [{ model: 'Mission', where: { isExpired: { [Op.ne]: 'y' } } }],
      attributes: ['gSeq'],
    });

    if (Groups) {
      for (const group of Groups) {
        // 미션 만료
        await Mission.update(
          { isExpired: 'y' },
          { where: { gSeq: group.gSeq } }
        );
        // 누적 점수 업데이트, 현재 점수 초기화
        await GroupUser.update(
          {
            guNowScore: 0,
            guTotalScore: sequelize.literal('guTotalScore+guNowScore'),
          },
          { where: { gSeq: group.gSeq } }
        );
        await Group.update({ gTotalScore: 0 }, { where: { gSeq: group.gSeq } });
      }
    }
  } catch (error) {
    // 기타 데이터베이스 오류
    console.log(error);
    res.status(500).send({
      success: false,
      msg: '서버에러 발생',
    });
  }
});
