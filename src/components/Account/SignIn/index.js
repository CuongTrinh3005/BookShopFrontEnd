import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import './SignIn.css'
import { endpointAuth, get, post } from '../../HttpUtils';

class Login extends Component {
    state = { username: "", password: "", roles: [], accessToken: "", tokenType: "" };

    handleSubmit(e) {
        e.preventDefault();
        this.setState({ username: e.target.username.value })
        this.setState({ password: e.target.password.value })

        const credentials = { username: this.state.username, password: this.state.password };

        post(endpointAuth + "/signin", credentials).then((response) => {
            if (response.status === 200) {
                this.setState({ username: response.data.username })
                this.setState({ roles: response.data.roles })
                this.setState({ accessToken: response.data.accessToken })
                this.setState({ tokenType: response.data.tokenType })
                this.saveLogInInfo();
                alert("Login successfully!");
            }
        }).catch(error => {
            console.log("error sigin: " + error);
            alert("Login failed! Check your input and try again!");
        })
    }

    saveLogInInfo() {
        localStorage.setItem("usernme", this.state.username);
        localStorage.setItem("acessToken", this.state.accessToken);
        localStorage.setItem("tokenType", this.state.tokenType);
        localStorage.setItem("role", this.state.roles[0]);
    }

    render() {
        return (
            <div className="login-form">
                <h3>LOGIN FORM</h3>
                <Form onSubmit={(e) => this.handleSubmit(e)}>
                    <FormGroup>
                        <Label for="username">Username</Label>
                        <Input style={{ width: "20rem" }} type="text" name="username"
                            id="username" placeholder="Enter your username" onChange={e => this.setState({ username: e.target.value })} />
                    </FormGroup>
                    <FormGroup>
                        <Label for="password">Password</Label>
                        <Input style={{ width: "20rem" }} type="password" name="password"
                            id="password" placeholder="Enter your password" onChange={e => this.setState({ password: e.target.value })} />
                    </FormGroup>
                    <Button color="info" style={{ marginTop: "1rem" }} type="submit">Sign In</Button>
                </Form>

            </div>
        );
    }
}

export default Login;