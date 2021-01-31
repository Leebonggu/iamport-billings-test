import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import axios from 'axios';
import Complete from './Complete';
import Home from './Home';

function App() {
  useEffect(() => {
    window.IMP.init('imp59902979');
    axios.get('/home').then(({ data: d }) => console.log(d));
  }, []);

  return (
    <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/complete">
            <Complete />
          </Route>
        </Switch>
    </Router>
  );
}

export default App;
