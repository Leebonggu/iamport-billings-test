import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Redirect
} from "react-router-dom";
import moment from 'moment';

function Home() {
  const [loading, setLaoding] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const onSubmitPayment = (e) => {
    e.preventDefault();
    const merchant_uid = `issue_billing_key_monthly_${moment().unix()}`
    const customer_uid = `customer_uid_${moment().unix()}`;
    window.IMP.request_pay({ // param
      pg: "html5_inicis",
      pay_method: "card", // "card"만 지원됩니다
      merchant_uid, // 빌링키 발급용 주문번호
      customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
      // name: "빌링키발급",
      amount: 100, // 0 으로 설정하여 빌링키 발급만 진행합니다.
    }, rsp => { // callback
      if (rsp.success) {
        // 빌링키 발급 성공
        console.log('customer_uid', customer_uid);
        console.log('rsp', rsp);
        axios({
          url: '/billings',
          method: 'post',
          headers: { "Content-Type": "application/json" },
          data: {
            customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          }
        })
        .then(({ data }) =>  {
          console.log(data);
          handleResultMessage(data);
          // if (data) {
          //   window.location.href = '/complete';
          // }
        })
      } else {
        // 빌링키 발급 실패
        const result = {
          status: rsp.succes,
          message: rsp.error_msg,
        };
        handleResultMessage(result);
      }
    });
  }

  const onSubmitUnsubscribe = async (e) => {
    e.preventDefault();
    const { data: result } = await axios({
      url: '/unsubscribe',
      method: 'post',
      headers: { "Content-Type": "application/json" },
    });
    handleResultMessage(result)
  }

  const handleResultMessage = (res) => {
    setResultMessage(res);
    setTimeout(() => {
      setResultMessage('');
    }, 3000);
  }

  return (
    <div>
      <h1>아임포트 정기결제 테스트</h1>
      {resultMessage && <span style={{ color: `${resultMessage.status ? 'blue': 'red'}` }}>{resultMessage.message}</span>}
      <form onSubmit={onSubmitPayment}>
        <button type="submit">결제</button> 
      </form>
      <form onSubmit={onSubmitUnsubscribe}>
        <button type="submit">취소</button> 
      </form>
    </div>
  )
}

export default Home
