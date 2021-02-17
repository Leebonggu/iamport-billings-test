const router = require('express').Router();
const axios = require('axios');
require('dotenv').config()
const kakaoDb = [];

const IMP_APIKEY = process.env.IMP_APIKEY;
const IMP_SECRET = process.env.IMP_SECRET;

router.get('/', (req, res) => {
  res.send('kakao');
});

router.post('/payments', async (req, res) => {
  try {
    const { imp_uid, merchant_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
    // 액세스 토큰(access token) 발급 받기
    /*
    REST API 액세스 토큰(access token)
    사적 리소스에 접근하는 모든 아임포트 REST API에 대한 요청에는 액세스 토큰(access token)을 포함해야 합니다.
    액세스 토큰의 발급 및 사용 방법은 REST API 액세스 토큰(access token) 문서에서 자세히 살펴볼 수 있습니다.
    */
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: IMP_APIKEY, // REST API키
        imp_secret: IMP_SECRET // REST API Secret
      }
    });
    console.log(getToken);
    const { access_token } = getToken.data.response; // 인증 토큰
    const getPaymentData = await axios({
      url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
      method: "get", // GET method
      headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
    });
    const paymentData = getPaymentData.data.response; // 조회한 결제 정보
    console.log(paymentData);
    const { amount, status } = paymentData;
    
    if (amount) {
      switch (status) {
        case "paid": // 결제 완료
          console.log(1, kakaoDb);
          kakaoDb.push(paymentData);
          console.log(2, kakaoDb);
          res.send({ status: "success", message: "일반 결제 성공", db: kakaoDb});
          break;
      }
    } else {
      throw { status: "forgery", message: "위조된 결제시도" };
    }
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
})

module.exports = router;