import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';

function Billings() {
  const [loading, setLaoding] = useState(false);
  const [connection, setConnection] = useState('');
  const [db, setDb] = useState([]);
  const [resultMessage, setResultMessage] = useState('');

  useEffect(() => {
    setLaoding(true);
    axios.get('/regular')
      .then(({ data }) => {
        console.log(data);
        setConnection(data.connect);
        setLaoding(false);
      })
  }, [])
  
  const onSubmitPayment = (e) => {
    e.preventDefault();
    setResultMessage('')
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
          url: '/regular/billings',
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
      url: '/regular/unsubscribe',
      method: 'post',
      headers: { "Content-Type": "application/json" },
    });
    handleResultMessage(result)
  };

  const onSubmitUpdateDatabase = async (e) => {
    e.preventDefault();
    axios.get('/regular/update')
      .then(({ data }) => console.log(data));
  } 

  const handleResultMessage = (res) => {
    setResultMessage(res);
  }
  return (
    <div>
      <h1>아임포트 정기결제 테스트</h1>
      {resultMessage && <span style={{ color: `${resultMessage.status ? 'blue': 'red'}` }}>{resultMessage.message}</span>}
      <div style={{ marginBottom: '1rem' }}>Connect: {connection ? connection : '연결중...'}</div>
      <form onSubmit={onSubmitPayment}>
        <button type="submit">결제</button> 
      </form>
      <form onSubmit={onSubmitUnsubscribe}>
        <button type="submit">취소</button> 
      </form>
      <form onSubmit={onSubmitUpdateDatabase}>
        <button type="submit">업데이트</button> 
      </form>
      <div style={{ marginTop: '1rem' }}>
        {!loading ? (
        <>
          {db.length ? db.map(e => (JSON.stringify(e))): '데이터가 없습니다'}
        </>
          ) : (
          <div>연결중...</div>
        )}
      </div>
    </div>
  )
}

export default Billings
