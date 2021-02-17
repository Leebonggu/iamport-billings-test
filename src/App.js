import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { createGlobalStyle } from 'styled-components';
import Home from './Home';
import Complete from './Complete';
import Billings from './Billings';
import Header from './Header';
import Kakaopay from './Kakaopay';
import Naverpay from './Naverpay';


const Global = createGlobalStyle`
  height: 1800px;
`;

function App() {
  useEffect(() => {
    window.IMP.init('imp59902979');
  }, []);

  return (
    <>
      <Global />
      <Router>
          <Header />
          <Switch>
            <Route exact path="/billings">
              <Billings />
            </Route>
            <Route exact path="/kakao">
              <Kakaopay />
            </Route>
            <Route exact path="/naver">
              <Naverpay />
            </Route>
            <Route exact path="/complete">
              <Complete />
            </Route>
            <Route exact path="/">
              <Home />
            </Route>
          </Switch>
      </Router>
    </>
  );
}

export default App;
