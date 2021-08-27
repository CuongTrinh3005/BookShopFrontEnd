import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import About from './components/About';
import Detail from './components/ProductDetails';
import BookByCategory from './components/BookByCategory';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import Aside from './components/Aside';
import ProductList from './components/ProductList/index';
import SignIn from './components/Account/SignIn/index';
import SignUp from './components/Account/SignUp/index';
import LogOut from './components/Account/LogOut';
import NewBookFilter from './components/Feature';
import CategoryManagement from './Admin/Category';
import BookManagement from './Admin/Book';
import BookGenerator from './Admin/Book/createNewUtil';
import BookUpdater from './Admin/Book/UpdateBook';
import UserManagement from './Admin/User';
import FilterByDiscount from './components/Feature/FilterByDiscount';
import Cart from './components/Cart';
import { getCookie, setCookie } from './components/CookieUtils';
import Checkout from './components/Checkout';
import UserOrders from './components/UserOrders';
import OrderDetail from './components/UserOrders/OrderDetail';
import ChangePassword from './components/Account/ChangePassword';
import ResetPassword from './components/Account/ResetPassword';
import UserDetails from './components/UserDetails';
import OrderManagement from './Admin/Order';
import OrderDetailForAdmin from './Admin/Order/OrderDetailForAdmin';
import AuthorManagement from './Admin/Author';
import PublisherManagement from './Admin/Publisher';
import FilterByTopView from './components/Feature/FilterByTopView';
import BestSelling from './components/Feature/BestSelling';
import BookSearching from './components/Searching';
import { endpointPublic, get } from './components/HttpUtils';

function App() {
  const [loginName, setloginName] = useState('')
  const [categoryList, setCategoryList] = useState([]);
  const [cartString, setCartString] = useState('');

  // Callback function for Navbar
  const getLoginName = (name) => {
    setloginName(name);
  }

  const addCartString = async (str) => {
    await setCartString(cartString + str)
  }

  const fetchCookie = async () => {
    const cookieValue = getCookie("cart");
    if (cookieValue === null || cookieValue.trim() === '')
      return;

    await setCartString(cookieValue);
  }

  // const fetchCategories = () => {
  //   get(endpointPublic + "/categories").then((response) => {
  //     if (response.status === 200) {
  //       setCategoryList(response.data);
  //     }
  //   })
  // }

  useEffect(() => {
    // fetchCategories();

    if (cartString === null || cartString.trim() === '') {
      fetchCookie();
    }
    if (cartString.trim() !== '') {
      setCookie("cart", cartString, 1);
      console.log("cart str: " + cartString);
    }


  }, [cartString]);

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar name={loginName} />
        <Container>
          <Row>
            <Col md="10" sm="9">
              <Switch>
                <Route exact path="/">
                  <Home name={loginName} />
                  <ProductList categoryName="" />
                </Route>

                <Route exact path="/detail/:id">
                  <h3>BOOK DETAILS</h3>
                  <Detail addCartString={addCartString} />
                </Route>

                <Route exact path="/about">
                  <About />
                </Route>

                <Route exact path="/books/search/:info">
                  <BookSearching />
                </Route>

                <Route exact path="/books/categoryId/:id">
                  <BookByCategory />
                </Route>

                <Route exact path="/account/signin">
                  <SignIn getLoginName={getLoginName} />
                </Route>

                <Route exact path="/account/signup">
                  <SignUp />
                </Route>

                <Route exact path="/account/change-password/:username">
                  <ChangePassword />
                </Route>

                <Route exact path="/account/logout">
                  <LogOut />
                </Route>

                <Route exact path="/account/reset-password">
                  <ResetPassword />
                </Route>

                <Route exact path="/account/details">
                  <UserDetails />
                </Route>

                <Route exact path="/feature/new">
                  <NewBookFilter />
                </Route>

                <Route exact path="/feature/discount">
                  <FilterByDiscount />
                </Route>

                <Route exact path="/feature/top-view">
                  <FilterByTopView />
                </Route>

                <Route exact path="/feature/best-selling">
                  <BestSelling />
                </Route>

                <Route exact path="/admin/categories">
                  <CategoryManagement />
                </Route>

                <Route exact path="/admin/books">
                  <BookManagement />
                </Route>

                <Route exact path="/admin/authors">
                  <AuthorManagement />
                </Route>

                <Route exact path="/admin/publishers">
                  <PublisherManagement />
                </Route>

                <Route exact path="/admin/orders">
                  <OrderManagement />
                </Route>

                <Route exact path="/admin/order-detail/:id">
                  <OrderDetailForAdmin />
                </Route>

                <Route exact path="/admin/book/new">
                  <BookGenerator />
                </Route>

                <Route exact path="/admin/book/detail/:id">
                  <BookUpdater />
                </Route>

                <Route exact path="/admin/users">
                  <UserManagement />
                </Route>

                <Route exact path="/cart">
                  <Cart />
                </Route>

                <Route exact path="/cart/checkout">
                  <Checkout />
                </Route>

                <Route exact path="/checkout/username/:username">
                  <UserOrders />
                </Route>

                <Route exact path="/checkout/detail/:orderid">
                  <OrderDetail />
                </Route>

                <Route path='*' exact={true} render={() => <h1>Route Not  Found</h1>} />
              </Switch>
            </Col>

            <Col sm="3" xs="4" lg="2" md="2" >
              <Aside />
            </Col>
          </Row>
        </Container>
      </div>
    </BrowserRouter>
  );
}

export default App;
