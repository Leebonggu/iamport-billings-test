import React, { useEffect } from 'react';
import moment from 'moment';
import styled from  'styled-components';
import axios from 'axios';

import ButtonImg from './static/kakaopay/payment_icon_yellow_medium.png'

const KaKaopayContainer = styled.div`
  margin-top: 1rem;
  display :flex;
  align-items: center;
`;

const SubmitBtn = styled.button`
  background: none;
  outline: none;
  border: none;
  img {
    object-fit: fill;
  }

  &:hover {
    opacity: 0.5;
  }

  &:active {
    opacity: 0.5;
  }
`;

function Kakaopay() {
  useEffect(() => {
    axios.get('/kakao')
      .then(data => console.log(data));
  })
  const onSubmit = (e) => {
    e.preventDefault();
    const merchant_uid = `merchant_uid_${moment().unix()}`; 
    window.IMP.request_pay({
      pg: 'kakaopay',
      pay_method: 'card',
      merchant_uid,
      name : '테스트',
      amount: 100,
      buyer_email: "dlqhdrn33@gmail.com",
      buyer_name: "이봉구",
      buyer_tel: "010-5031-637",
      buyer_addr: "서울특별시 강남구",
    }, (rsp) => {
      console.log(rsp);
      if (rsp.success) {
        axios({
          url: '/kakao/payments',
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          data: {
            imp_uid: rsp.imp_uid,
            merchant_uid: rsp.merchant_uid,
            name: rsp.name,
         }
        })
        .then(({ data }) => {
          console.log('dd', data);
          switch(data.status) {
            case "success":
              console.log(data);
              break;
          }
        })
      } else {
        window.alert(`결제에 실패하였습니다. 에러 내용: ${rsp.error_msg}`);
        console.log('결제취소');
      }
    })
  };

  return (
    <KaKaopayContainer>
      카카오페이
      <form onSubmit={onSubmit}>
        <SubmitBtn type="submit">
          <img src={ButtonImg} />
        </SubmitBtn>
      </form>
    </KaKaopayContainer>
  );
}

export default Kakaopay;

