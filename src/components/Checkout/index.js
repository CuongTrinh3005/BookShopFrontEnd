import React, { Component } from 'react';
import { getCookie, setCookie, deleteCookie } from '../CookieUtils';
import { endpointPublic, get, getWithAuth, endpointUser, postwithAuth, hostFrontend } from '../HttpUtils';
import { Input, Button, Form, FormGroup, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import { messages } from '../message';
import { formatter } from '../Formatter';

toast.configure();
class Checkout extends Component {
    state = { cart: [], book: {}, authorIds: [], user: {}, shippingAddress: "", description: "", errors: {} }
    componentDidMount() {
        this.fetchCart();
        this.fetchUserInfo(localStorage.getItem("username"));
    }

    async fetchBookById(id) {
        await get(endpointPublic + "/books/" + id).then((response) => {
            if (response.status === 200) {
                this.setState({ book: response.data })
                this.setState({ authorIds: response.data.authorIds })
            }
        }).catch((error) => console.log("Fetching book by id error: " + error))
    }

    prePareForCart(id, quantityInp) {
        this.fetchBookById(id).then(() => {
            if (this.handleCheck(this.state.book) !== true) {
                this.setState(prevState => {
                    let book = Object.assign({}, prevState.book);  // creating copy of state variable jasper
                    book.quantity = quantityInp;                     // update the name property, assign a new value                 
                    return { book };                                 // return new object jasper object
                })

                this.state.cart.push(this.state.book);
            }
            else {
                this.setState(prevState => ({
                    cart: prevState.cart.map(
                        obj => (obj.bookId === id ? Object.assign(obj, { quantity: obj.quantity + quantityInp }) : obj)
                    )
                }));
            }
            this.setState({ cart: this.state.cart })
        })

    }

    handleCheck(val) {
        return this.state.cart.some(item => val.bookId === item.bookId);
    }

    checkCookieExist() {
        var cookieStr = getCookie("cart");
        if (cookieStr === null || cookieStr === '') {
            return false;
        }
        return true;
    }

    fetchCart = () => {
        let cartString = getCookie("cart");
        if (cartString !== null || cartString !== '') {
            let arrProd = cartString.split("|");

            for (let i = 0; i < arrProd.length - 1; i++) {
                let prodDetail = arrProd[i].split("-");
                let id = prodDetail[0];
                let quantity = prodDetail[1];
                console.log("id: " + id + ", quantity: " + quantity);

                this.prePareForCart(id, quantity);
            }
        }
    }

    getQuantityOfBook(id) {
        let quantity;
        this.state.cart.map(
            obj => (obj.bookId === id ? quantity = obj.quantity : quantity = -1));

        return quantity;
    }

    remove_book_on_list = (id) => {
        if (window.confirm(messages.deleteConfirm)) {
            let quantity = this.state.cart.find(x => x.bookId === id).quantity;

            this.setState({
                cart: this.state.cart.filter(item => item.bookId !== id)
            })

            const itemStrDelete = id + "-" + quantity + "|";
            console.log("Cookie to remove: " + itemStrDelete);
            // remove this item in cookie
            let cartString = getCookie("cart").replace(itemStrDelete, '');
            console.log("Cookie after remove: " + cartString);
            setCookie("cart", cartString, 1);
        }
    }

    getTotalCartPrice() {
        let totalPrice = 0;
        for (let index = 0; index < this.state.cart.length; index++) {
            const price = (1 - this.state.cart[index].discount)
                * this.state.cart[index].unitPrice * this.state.cart[index].quantity;
            totalPrice += price;
        }
        return totalPrice;
    }

    fetchUserInfo(username) {
        getWithAuth(endpointUser + "/users/" + username).then((response) => {
            if (response.status === 200) {
                this.setState({ user: response.data })
                this.setState({ shippingAddress: response.data.address })
            }
        }).catch((error) => console.log("Fetching user error: " + error))
    }

    prepareOrderDetailID(bookId) {
        const orderDetailId = { "bookId": bookId }
        return orderDetailId;
    }

    prepareOrderDetail(book) {
        const orderDetail = {
            "orderDetailID": this.prepareOrderDetailID(book.bookId),
            "quantityOrder": book.quantity,
            "discount": book.discount,
            "unitPrice": book.unitPrice
        }

        return orderDetail;
    }

    validateForm() {
        let errors = {}, formIsValid = true;
        if (!this.state.shippingAddress && this.state.shippingAddress === '') {
            errors["shippingAddress"] = "Vui l??ng kh??ng ????? tr???ng th??ng tin ?????a ch??? giao h??ng";
            formIsValid = false;
        }
        else if (this.state.shippingAddress.trim().length < 5) {
            errors["shippingAddress"] = messages.addressUserOrder;
            formIsValid = false;
        }

        this.setState({ errors: errors })

        return formIsValid;
    }

    onCheckoutConfirm(e) {
        e.preventDefault();
        if (!this.validateForm())
            return;

        console.log("Shipping address: " + e.target.orderAddress.value);
        console.log("Description: " + e.target.description.value);

        let detailArr = [];
        for (let index = 0; index < this.state.cart.length; index++) {
            detailArr.push(this.prepareOrderDetail(this.state.cart[index]))
        }

        const orderBody = {
            "orderAddress": e.target.orderAddress.value.trim(),
            "description": e.target.description.value.trim(),
            "orderDetail": detailArr
        }

        console.log("order Body:  " + JSON.stringify(orderBody))

        postwithAuth(endpointUser + "/orders?username=" + this.state.user.userName, orderBody).then((response) => {
            if (response.status === 200 || response.status === 201) {
                console.log("Ordering successfully!");

                toast.success(messages.orderSuccess, {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2000,
                });
                deleteCookie("cart", "/", "localhost");
                setTimeout(function () {
                    window.location.replace(hostFrontend + "checkout/username/" + localStorage.getItem("username"));
                }, 2000);
            }
        }).catch(error => {
            toast.error(messages.orderFailed + error.response.data.message, {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 2000,
            });
            console.log("error order book: " + error);
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        })
    }

    renderCheckoutList() {
        return (
            <div>
                <Form onSubmit={(e) => this.onCheckoutConfirm(e)}>
                    <FormGroup>
                        <Label for="username">T??n ????ng nh???p</Label>
                        <Input style={{ width: "20rem" }} type="text" name="username" readOnly="true"
                            id="username" value={this.state.user.userName} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="fullname">H??? t??n</Label>
                        <Input style={{ width: "20rem" }} type="fullname" name="fullname" readOnly="true"
                            id="fullname" value={this.state.user.fullName} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="orderAddress">?????a ch??? giao</Label>
                        <Input style={{ width: "20rem" }} type="orderAddress" name="orderAddress" id="orderAddress"
                            placeholder="?????a ch??? giao" value={this.state.shippingAddress} required
                            onChange={e => this.setState({ shippingAddress: e.target.value })} />
                        <span style={{ color: "red" }}>{this.state.errors["shippingAddress"]}</span>
                    </FormGroup>
                    <FormGroup>
                        <Label for="description">M?? t???</Label>
                        <Input style={{ width: "20rem" }} type="description" name="description"
                            id="description" placeholder="M?? t???"
                            onChange={e => this.setState({ description: e.target.value })} />
                    </FormGroup>

                    <h3 className="title-order">TH??NG TIN ????N H??NG</h3>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                {/* <th>Book ID</th> */}
                                <th>T??n s??ch</th>
                                <th>???nh</th>
                                <th>S??? l?????ng</th>
                                <th>????n gi??</th>
                                <th>Gi???m gi??</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.cart.map((book) => (
                                <tr key={book.id}>
                                    {/* <td>{book.bookId}</td> */}
                                    <td>{book.bookName}</td>
                                    <td><img width="150" height="100" src={`data:image/jpeg;base64,${book.photo}`} alt="Loading..."></img></td>
                                    <td>{book.quantity}</td>
                                    <td>{formatter.format(book.unitPrice)}</td>
                                    <td>{book.discount * 100}%</td>
                                    <td>{formatter.format((1 - book.discount) * book.quantity * book.unitPrice)}</td>
                                    <td><Button color="danger" onClick={() => this.remove_book_on_list(book.bookId)}>X??a</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <hr />
                    <h6 className="total-price">T???ng c???ng: {formatter.format(this.getTotalCartPrice())}</h6>

                    <Button color="info" variant="contained" style={{ float: 'right' }, { marginTop: "2rem" }}>X??C NH???N ?????T H??NG</Button>
                </Form>
                <br />
                <br />
                <br />
            </div>
        );
    }

    renderEmptyCheckoutList() {
        return (
            <div>
                <h6 align="center">B???n kh??ng c?? s???n ph???m ????? th???c hi???n mua</h6>
            </div>
        );
    }

    render() {
        return (
            <div >
                <h1 className="cart-list alert alert-warning" align="center">X??C NH???N TH??NG TIN ?????T H??NG</h1>
                {this.state.cart.length > 0 ? this.renderCheckoutList() : this.renderEmptyCheckoutList()}
            </div>
        );
    }
}

export default Checkout;