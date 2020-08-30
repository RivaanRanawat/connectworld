import React, {Component} from 'react';
import {Link} from "react-router-dom";
import firebase from "../../Services/firebase";

import LoginString from "../Login/LoginStrings";
import "./Login.css";
import {CssBaseline, TextField, FormControlLabel, Checkbox, Grid, Typography} from "@material-ui/core";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            email: "",
            password: ""
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            [event.target.name] : event.target.value
        });
    }

    componentDidMount() {
        {/* if logged in, push details to chat */}
        if(localStorage.getItem(LoginString.ID)) {
            this.setState({isLoading: false}, () => {
                this.setState({isLoading: false})
                this.props.showToast(1, "Login Success")
                this.props.history.push('./chat')
            })
        } else {
            this.setState({isLoading: false})
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        .then(async result=>{
            let user = result.user;
            if(user) {
                await firebase.firestore().collection("users")
                .where("id", "==", user.uid)
                .get()
                .then(function(snap) {
                    snap.forEach(function(doc) {
                        const currentData = doc.data();
                        localStorage.setItem(LoginString.FirebaseDocumentId, doc.id);
                        localStorage.setItem(LoginString.ID, currentData.id);
                        localStorage.setItem(LoginString.Name, currentData.name);
                        localStorage.setItem(LoginString.Email, currentData.email);                                                     
                        localStorage.setItem(LoginString.Password, currentData.password);
                        localStorage.setItem(LoginString.PhotoUrl, currentData.URL);
                        localStorage.setItem(LoginString.Description, currentData.description);
                    })
                })
            }

            this.props.history.push('./chat');
        }).catch(function(err) {
            document.getElementById("1").innerHTML = "Incorrect Email or Password."
        })
    }

    render() {
        const paper = {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingLeft: '10px',
            paddingRight: '10px'
        }

        const rightcomponent = {
            boxShadow: '0 80px 80px #808888',
            backgroundColor: 'smokegrey'
        }

        const root = {
            height: '100vh',
            background: 'linear-gradient(90deg, #e3ffe7 0%, #d9e7ff 100%)',
            marginBottom: '50px'
        }

        const form = {
            width: '100%',
            marginTop: '50px'
        }

        const avatar = {
            backgroundColor: 'green'
        }
        return(
            <Grid container component="main" style={root}>
                <CssBaseline/>
                <Grid item xs={1} sm={4} md={7}>
                    <div className="image1"></div>
                </Grid>
                <Grid item xs={12} sm={8} md={5} style={rightcomponent} elevation={6} square>
                    <div style={paper}>
                        <form style={form} noValidate onSubmit={this.handleSubmit}>
                            <TextField 
                            variant="outlined" 
                            margin="normal" 
                            required 
                            fullWidth 
                            id="email" 
                            label="Email" 
                            name="email" 
                            autoComplete="email" 
                            autoFocus 
                            onChange={this.handleChange} 
                            value={this.state.email}
                            />

                            <TextField 
                            variant="outlined" 
                            margin="normal" 
                            required 
                            fullWidth 
                            id="password" 
                            label="Password" 
                            name="password" 
                            type="password"
                            autoComplete="current-password" 
                            autoFocus 
                            onChange={this.handleChange} 
                            value={this.state.password}
                            />

                            <FormControlLabel
                            control={<Checkbox value="remember" color="primary"/>}
                            label="Remember me"
                            />

                            <Typography component="h6" variant="h5">
                                {this.state.error?(
                                    <p className="text-danger">{this.state.error}</p>
                                ): null}
                            </Typography>
                                <div className="CenterAligningItems">
                                    <button className="loginButton" type="submit">
                                        <span>Login</span>
                                    </button>
                                </div>

                                <div className="CenterAligningItems">
                                <p>Dont have an account?</p>
                                    <Link to="/signup" variant="body2">
                                        Sign up
                                    </Link>
                                </div>
                                <div className="error">
                                    <p id='1' style={{color: 'red'}}></p>
                                </div>
                        </form>
                    </div>

                </Grid>
            </Grid>
        )
    }
}
