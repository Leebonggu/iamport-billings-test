import {
  Link,
} from "react-router-dom";
import styled from 'styled-components';

const HeaderContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  a {
    margin-right: 1rem;
    text-decoration: none;
    color: cornflowerblue;

    &:hover {
      color: chartreuse;
    }
  }
`;

function Header() {
  return (
    <HeaderContainer>
      <Link exact to="/">홈</Link>
      <Link exact to="/billings">정기결제</Link>
      <Link exact to="/kakao">카카오</Link>
      <Link exact to="/naver">네이버</Link>
    </HeaderContainer>
  );
}

export default Header;