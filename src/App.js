import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Contact from './components/Contact';
import HelloWord from './components/HelloWorld';
import Detail from './components/ProductDetails';
import BookByCategory from './components/BookByCategory';
import { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import Aside from './components/Aside';
import CartItem from './components/CardItem/index';
import SignIn from './components/Account/SignIn/index'
// src\components\Account\SignIn

function App() {
  const [bootcamp, setBootcamp] = useState('Rookies')
  const [categoryName, setCategoryName] = useState('');

  // Callback function for Navbar
  const getCategoryName = (categoryName) => {
    setCategoryName(categoryName)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar name={bootcamp} getCategoryName={getCategoryName} />
        <Container>
          <Row>
            <Col md="9" sm="6">
              <Switch>
                <Route exact path="/">
                  <Home name={bootcamp} />
                  <CartItem categoryName="" />
                </Route>

                <Route exact path="/detail/:id">
                  <h3>BOOK DETAILS</h3>
                  <Detail />
                </Route>

                <Route exact path="/hello">
                  <HelloWord />
                </Route>

                <Route path="/hello/:username">
                  <HelloWord />
                </Route>

                <Route exact path="/books/category=:categoryName">
                  <BookByCategory />
                </Route>

                <Route exact path="/account/signin">
                  <SignIn />
                </Route>

                <Route path='*' exact={true} render={() => <h1>Route Not  Found</h1>} />


              </Switch>

            </Col>

            <Col sm="6" xs="6" lg="2">
              <Aside />
            </Col>
          </Row>
        </Container>


      </div>
    </BrowserRouter>
  );
}

export default App;
