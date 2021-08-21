import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { ListGroup, ListGroupItem } from 'reactstrap';

class Aside extends Component {
    render() {
        return (
            <div>
                <br />
                <br />
                <br />

                <h6>ON YOUR CHOICE</h6>
                <ListGroup>
                    <Link to="/feature/new"><ListGroupItem>New book</ListGroupItem></Link>
                    <Link to="/feature/discount"><ListGroupItem>On Sale</ListGroupItem></Link>
                    <Link to="/feature/top-view"><ListGroupItem>Top View</ListGroupItem></Link>
                    {/* <ListGroupItem>Top View</ListGroupItem>
                    <ListGroupItem>Best Seller</ListGroupItem> */}
                </ListGroup>
            </div>
        );
    }
}

export default withRouter(Aside);