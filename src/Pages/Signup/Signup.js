import React,{Component} from 'react';
import {Link} from "react-router-dom";
import "./Signup.css";
import firebase from "../../Services/firebase";
import {Card} from "react-bootstrap";
import {CssBaseline, TextField, Box, Typography} from "@material-ui/core";
import LoginString from '../Login/LoginStrings';

export default class Signup extends Component {

    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            name: "",
            error: null
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    async handleSubmit(event) {
        const {name, email, password} = this.state;
        event.preventDefault();

        try{
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(async result => {
                firebase.firestore().collection('users')
                .add({
                    name,
                    id: result.user.uid,
                    email,
                    password,
                    URL: "",
                    messages: [{notificationId: "", number: 0}]
                }).then((docRef) => {
                    localStorage.setItem(LoginString.ID, result.user.uid);
                    localStorage.setItem(LoginString.Name, name);
                    localStorage.setItem(LoginString.Email, email);
                    localStorage.setItem(LoginString.Password, password);
                    localStorage.setItem(LoginString.PhotoUrl, "");
                    localStorage.setItem(LoginString.UPLOAD_CHANGED, 'state_changed');
                    localStorage.setItem(LoginString.Description, "");
                    localStorage.setItem(LoginString.FirebaseDocumentId, docRef.id);

                    this.setState({
                        name: '',
                        password: '',
                        url: '',
                    });
                    this.props.history.push("/chat");
                })
                .catch((err) => {
                    console.error(err);
                })
            })
        } catch{
            document.getElementById('1').innerHTML = "Sign Up Failed."
        }
    }

    render() {
        return (
            <div>
                <CssBaseline/>
                <Card className="formacontrooutside">
                    <form className="customform" noValidate onSubmit={this.handleSubmit}>
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
                        <TextField 
                        variant="outlined" 
                        margin="normal" 
                        required 
                        fullWidth 
                        id="name" 
                        label="Full Name" 
                        name="name" 
                        autoComplete="name" 
                        autoFocus 
                        onChange={this.handleChange} 
                        value={this.state.name}
                        />
                        <div className="CenterAligningItems">
                            <button className="button1" type="submit">
                                <span>Sign up</span>
                            </button>
                        </div>  
                        <div>
                            <p style={{color: 'grey'}}>Already Have an Account?</p>
                            <Link to="/login">
                                Login
                            </Link>
                        </div>
                        <div className="error">
                            <p id='1' style={{color: 'red'}}></p>
                        </div>
                    </form>
                </Card>
            </div>
        )
    }
    
}
