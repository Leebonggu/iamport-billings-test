const express = require('express');

const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const regular = require('./regular');
const kakao = require('./kakaopay');
const naver = require('./naverpay');

const PORT = 4000;


const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.use(bodyParser.urlencoded({ extended: false }));
// bodyParser 미들웨어의 여러 옵션 중에 하나로 false 값일 시 node.js에 기본으로 내장된 queryString,
app.use(bodyParser.json());
app.use('/regular', regular);
app.use('/kakao', kakao);
app.use('/naver', naver);

app.get('/home', (req, res) => {
  res.status(200).send({
    connect: 'Connect',
  });
});

app.listen(PORT, () => {
  console.log(`running server at http://localhost:${PORT}`)
});
