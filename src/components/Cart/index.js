import React, { Component } from 'react';
import { endpointPublic, get } from '../HttpUtils';
import { Input, Button } from 'reactstrap';
import './style.css';

// var list;
class CartItem extends Component {
    state = { cart: [], book: {}, authorIds: [] }

    getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    componentDidMount() {
        this.fetchCart();
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
                // this.setState(prevState => {
                //     let book = Object.assign({}, prevState.book);
                //     console.log("Prevstate  book: " + book.quantity)
                //     book.quantity = parseInt(quantityInp) + parseInt(book.quantity);
                //     console.log("quantity input: ", quantityInp)
                //     console.log("Sumt: ", book.quantity)
                //     return { book };
                // })
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
        var cookieStr = this.getCookie("cart");
        if (cookieStr === null || cookieStr === '') {
            return false;
        }
        return true;
    }

    fetchCart = () => {
        // const cookieExist = this.checkCookieExist();
        // let cartString;
        // if (cookieExist) {
        //     cartString = this.getCookie("cart");
        // }
        // else cartString = window.sessionStorage.setItem("cart_SESS");

        let cartString = this.getCookie("cart");
        if (cartString !== null || cartString !== '') {
            let arrProd = cartString.split("|");

            for (let i = 0; i < arrProd.length - 1; i++) {
                let prodDetail = arrProd[i].split("-");
                let id = prodDetail[0];
                let quantity = prodDetail[1];
                console.log("id: " + id + ", quantity: " + quantity);

                // this.fetchBookById(id);
                this.prePareForCart(id, quantity);
            }
        }
    }

    formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 2
    })

    remove_book_on_list = (id) => {
        if (window.confirm('Do you actually want to delete?')) {
            this.setState({
                cart: this.state.cart.filter(item => item.bookId != id)
            })
            this.fetchCart();
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

    onQuantityChange(id, e) {
        this.setState(prevState => ({
            cart: prevState.cart.map(
                obj => (obj.bookId === id ? Object.assign(obj, { quantity: e.target.value }) : obj)
            )
        }));
    }

    render() {
        return (
            <div>
                <h1 class="cart-list">MY SHOPPING CART</h1>
                <table>
                    <thead>
                        <tr>
                            {/* <th>Book ID</th> */}
                            <th>Book Name</th>
                            <th>Image</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
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
                                <td><Input value={book.quantity} onChange={(e) => this.onQuantityChange(book.bookId, e)}
                                    type="number" min="1" style={{ width: "5rem" }} /> </td>
                                <td>{book.unitPrice}</td>
                                <td>{book.discount * 100}%</td>
                                <td>{this.formatter.format((1 - book.discount) * book.quantity * book.unitPrice)}</td>
                                <td><Button color="danger" onClick={() => this.remove_book_on_list(book.bookId)}>DELETE</Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <hr />
                <h6>Total: {this.formatter.format(this.getTotalCartPrice())}</h6>
            </div>
        );
    }
}

export default CartItem;