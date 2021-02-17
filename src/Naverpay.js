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

function Naverpay() {
  useEffect(() => {
    axios.get('/naver')
      .then(data => console.log(data));
  })
  const onSubmit = (e) => {
    e.preventDefault();
    const merchant_uid = `merchant_uid_${moment().unix()}`; 
    window.IMP.request_pay({
      pg: 'naverpay',
      pay_method: 'card',
      merchant_uid,
      name : '테스트',
      amount: 100,
      buyer_email: "dlqhdrn33@gmail.com",
      buyer_name: "이봉구",
      buyer_tel: "010-5031-637",
      buyer_addr: "서울특별시 강남구",
      naverPopupMode : true,
      naverProducts : [{ //상품정보(필수전달사항) 네이버페이 매뉴얼의 productItems 파라메터와 동일합니다.
        "categoryType": "BOOK",
        "categoryId": "GENERAL",
        "uid": "107922211",
        "name": "미래통찰보고서",
        "payReferrer": "NAVER_BOOK",
        "count": 1
      }]
    }, (rsp) => {
      console.log(rsp);
      if (rsp.success) {
        axios({
          url: '/naver/payments',
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
      네이버페이
      <form onSubmit={onSubmit}>
        <SubmitBtn type="submit">
          결제하기
        </SubmitBtn>
      </form>
    </KaKaopayContainer>
  );
}

export default Naverpay;

