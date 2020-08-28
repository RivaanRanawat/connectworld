import React from 'react'
import LoginString from '../Login/LoginStrings';
import firebase from "../../Services/firebase";

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.currentUserName = localStorage.getItem(LoginString.Name);
    }

    logout = () => {
        firebase.auth().signOut();
        this.props.history.push('/');
        localStorage.clear();
    }
    render() {
        return (
            <div>
                <h1>{this.currentUserName}</h1>
                <button onClick={this.logout}>Log Out</button>
            </div>
        )
    }
}
