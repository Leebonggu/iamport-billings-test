const express = require('express');
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const moment = require('moment');

require('dotenv').config()

const db = [];

const database = require('./database.json');

const PORT = 4000;
const IMP_APIKEY = process.env.IMP_APIKEY;
const IMP_SECRET = process.env.IMP_SECRET;

const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.urlencoded({ extended: false }));
// bodyParser 미들웨어의 여러 옵션 중에 하나로 false 값일 시 node.js에 기본으로 내장된 queryString,
app.use(bodyParser.json());

app.get('/home', (req, res) => {
  console.log('db0', database);
  res.status(200).send({
    connect: 'Connect',
    database: db,
  });
});

app.get('/update', (req, res) => {
    // merchant_uid,
    // status,
    // customer_uid,
    // paid_at,
    // next_paid_at: nextPaymentTime,
    // amount,
    // name,
    // authentication: true,
    // cancel: false,
    // cancel_request_date: null,
    // cancel_process_date: null,
  db.forEach((e) => {
    if (e.cancel) {
      if (e.next_paid_at < moment().unix()) {
        e['cancel_process_date'] = moment().unix();
        e['authentication'] = false;
      }
    }
  })
  res.send('helloo');
})


app.post('/billings', async(req, res) => {
  try {
    console.log('db start billings: ', db)
    const { customer_uid  } = req.body;
    const merchant_uid = `merchant_uid_첫결제_${moment().unix()}`; 
    const getToken = await axios({
      url: "https://api.iamport.kr/users/getToken",
      method: "post", // POST method
      headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
      data: {
        imp_key: IMP_APIKEY, // REST API키
        imp_secret: IMP_SECRET // REST API Secret
      }
    });

    const { access_token } = getToken.data.response;
    const paymentResult = await axios({
      url: `https://api.iamport.kr/subscribe/payments/again`,
      method: "post",
      headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
      data: {
        customer_uid,
        merchant_uid, // 새로 생성한 결제(재결제)용 주문 번호
        amount: 100,
        name: `월간 이용권 정기결제-${db.length + 1}`
      }
    });
    
    const { code, message, response } = paymentResult.data;
    if (code === 0) { // 카드사 통신에 성공(실제 승인 성공 여부는 추가 판단이 필요합니다.)
      if ( response.status === "paid" ) { //카드 정상 승인
        console.log('in billing response', response);
        // const { customer_uid, merchant_uid, status, paid_at, amount,name } = response;
        //   const nextPaymentTime = moment(paid_at * 1000).add(3, 'minutes').unix();
        // const data = {
        //   merchant_uid,
        //   status,
        //   customer_uid,
        //   paid_at,
        //   next_paid_at: nextPaymentTime,
        //   amount,
        //   name,
        //   authentication: true,
        // }
        // db.push(data);
        return res.send({
          status: true,
          message: '예약이 성공적으로  이루어졌습니다.',
        });
      } else { //카드 승인 실패 (ex. 고객 카드 한도초과, 거래정지카드, 잔액부족 등)

        return res.send({
          status: false,
          message: response.fail_reason,
        });
      }
      // res.send({ ... });
    } else { // 카드사 요청에 실패 (paymentResult is null)
      // res.send({ ... });
      console.log(response.fail_reason);
      console.log(message);
      return res.send({
        status: false,
        message: response.fail_reason,
      });
    }
  } catch(e) {
    res.status(400).send(e);
  }
});

app.post('/unsubscribe', async (req, res) => {
  console.log('cancel subscribe start');
  const getToken = await axios({
    url: "https://api.iamport.kr/users/getToken",
    method: "post", // POST method
    headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
    data: {
      imp_key: IMP_APIKEY, // REST API키
      imp_secret: IMP_SECRET // REST API Secret
    }
  });

  const { access_token } = getToken.data.response;
  const lastedPaymentData = db[db.length - 1];
  if (!lastedPaymentData) {
    return res.send({
      status: false,
      message: '결제내용이 없습니다.',
    });
  }
  const {customer_uid, merchant_uid } = lastedPaymentData;
  console.log('lastedPaymentData', lastedPaymentData);
  console.log('customer_uid', customer_uid);
  console.log('merchant_uid', merchant_uid);
  const unsubscribeResult = await axios({
    url: `https://api.iamport.kr/subscribe/payments/unschedule`,
    method: "post",
    headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
    data: {
      customer_uid,
    }
  });
  console.log('cancel subscribe end');
  // console.log('unsubscribeResult', unsubscribeResult);
  const { data: result } = unsubscribeResult;
  // console.log(result);
  if (result.code === 0) { 
    console.log('result', result);
    const index = db.length - 1;
    db[index]['cancel'] = true;
    db[index]['cancel_request_date'] = moment().unix();
    // merchant_uid,
    // status,
    // customer_uid,
    // paid_at,
    // next_paid_at: nextPaymentTime,
    // amount,
    // name,
    // authentication: true,
    // cancel: false,
    // cancel_request_date: null,
    // cancel_process_date: null,
    return res.send({
      status: true,
      message: '예약이 성공적으로 취소되었습니다',
    });
  }
});

app.post("/iamport-callback/schedule", async (req, res) => {
  const { imp_uid, merchant_uid } = req.body;
  try {
      console.log('in callback schedule imp_uid',imp_uid);
      console.log('in callback schedule merchant_uid',merchant_uid);
      console.log('db in callback/schedule 1: ', db);
      const getToken = await axios({
        url: "https://api.iamport.kr/users/getToken",
        method: "post", // POST method
        headers: { "Content-Type": "application/json" }, // "Content-Type": "application/json"
        data: {
          imp_key: IMP_APIKEY, // REST API키
          imp_secret: IMP_SECRET // REST API Secret
        }
      });
      const { access_token } = getToken.data.response; // 인증 토큰
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
        method: "get", // GET method
        headers: { "Authorization": access_token } // 인증 토큰 Authorization header에 추가
      });

      // console.log('getPaymentData', getPaymentData);
      console.log('in callback schedule getPaymentData.data.response', getPaymentData.data.response);

      const { status, customer_uid, message, paid_at, amount, name, buyer_name ,buyer_tel, buyer_email } = getPaymentData.data.response;
      // console.log('getPaymentData', getPaymentData);
      if (status === "paid") { 
        // 결제 완료
        // const currentPaymentTime = moment(paid_at * 1000).unix();
        // 예약결제 시간
        const nextPaymentTime = moment(paid_at * 1000).add(3, 'minutes').unix();
        // 예약결제 merchant_uid
        const nextMerchantId = `merchant_uid_다음결제_${nextPaymentTime}`;
        // if (name !== '최초인증결제') {
        // }
        const splitedMerchantKey = merchant_uid.split('_');
        if(!splitedMerchantKey.includes('billing')) {
          const data = {
            merchant_uid,
            status,
            customer_uid,
            paid_at,
            next_paid_at: nextPaymentTime,
            amount,
            name,
            authentication: true,
            cancel: false,
            cancel_request_date: null,
            cancel_process_date: null,
          }
          db.push(data);
          console.log(db);
        } else {
          return res.send({
            status: true,
            message: 'billingkey 발급완료',
          });
        }
        axios({
          url: `https://api.iamport.kr/subscribe/payments/schedule`,
          method: "post",
          headers: { "Authorization": access_token }, // 인증 토큰 Authorization header에 추가
          data: {
            customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
            schedules: [
              {
                merchant_uid: nextMerchantId, // 주문 번호
                schedule_at: nextPaymentTime, // 결제 시도 시각 in Unix Time Stamp. ex. 다음 달 1일
                amount: amount,
                name: `월간 이용권 정기결제-${db.length}`,
              }
            ]
          }
        });
        console.log('ending db', db);
    } else {
      // 재결제 시도 => 권한을 빼자.
      const currentUser = db.filter((e) => (e.customer_uid === customer_uid));
      currentUser.authentication = false;
      console.log(message);
      console.log(db);
      return res.send({
        status: false,
        message: message,
      })
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

app.listen(PORT, () => {
  console.log(`running server at http://localhost:${PORT}`)
});

// {
//   "code": 0,
//   "message": "string",
//   "response": {
//     "imp_uid": "string",
//     "merchant_uid": "string",
//     "pay_method": "string",
//     "channel": "pc",
//     "pg_provider": "string",
//     "pg_tid": "string",
//     "pg_id": "string",
//     "escrow": true,
//     "apply_num": "string",
//     "bank_code": "string",
//     "bank_name": "string",
//     "card_code": "string",
//     "card_name": "string",
//     "card_quota": 0,
//     "card_number": "string",
//     "card_type": "null",
//     "vbank_code": "string",
//     "vbank_name": "string",
//     "vbank_num": "string",
//     "vbank_holder": "string",
//     "vbank_date": 0,
//     "vbank_issued_at": 0,
//     "name": "string",
//     "amount": 0,
//     "cancel_amount": 0,
//     "currency": "string",
//     "buyer_name": "string",
//     "buyer_email": "string",
//     "buyer_tel": "string",
//     "buyer_addr": "string",
//     "buyer_postcode": "string",
//     "custom_data": "string",
//     "user_agent": "string",
//     "status": "ready",
//     "started_at": 0,
//     "paid_at": 0,
//     "failed_at": 0,
//     "cancelled_at": 0,
//     "fail_reason": "string",
//     "cancel_reason": "string",
//     "receipt_url": "string",
//     "cancel_history": [
//       {
//         "pg_tid": "string",
//         "amount": 0,
//         "cancelled_at": 0,
//         "reason": "string",
//         "receipt_url": "string"
//       }
//     ],
//     "cancel_receipt_urls": [
//       "string"
//     ],
//     "cash_receipt_issued": true,
//     "customer_uid": "string",
//     "customer_uid_usage": "issue"
//   }
// }

// db in callback/schedule 1:  [
//   {
//     merchant_uid: 'issue_billingkey_monthly_1611820131',
//     status: 'paid',
//     customer_uid: 'customer_uid_1611820131',
//     paid_at: 1611820176,
//     next_paid_at: 1611820356,
//     amount: 0,
//     name: '최초인증결제'
//   },
//   {
//     merchant_uid: 'merchant_uid_1611820179',
//     status: 'paid',
//     customer_uid: 'customer_uid_1611820131',
//     paid_at: 1611820179,
//     next_paid_at: 1611820359,
//     amount: 100,
//     name: '월간 이용권 정기결제-0'
//   }
// ]