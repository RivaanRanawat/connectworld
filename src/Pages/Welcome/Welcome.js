import React, {Component} from 'react';
import 'react-toastify/dist/ReactToastify.css';
import "./WelcomeCard.css";

export default class Welcome extends Component {
    render() {
        return (
            <div className="viewWelcomeBoard">
                <img className="avatarWelcome" src={this.props.currentUserPhoto} alt=""/>
        <span className="textTitleWelcome">{`Welcome, ${this.props.currentUserName}`}</span>
        <span className="textDesciptionWelcome">Let's Connect With The World</span>
            </div>
        )
    }
}
