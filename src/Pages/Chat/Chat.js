import React from 'react'
import LoginString from '../Login/LoginStrings';
import firebase from "../../Services/firebase";
import "./Chat.css";
import ChatBox from "../ChatBox/ChatBox";
import WelcomeBoard from "../Welcome/Welcome";
import ReactLoading from "react-loading";
import {FaSistrix} from "react-icons/fa"

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isOpenDialog: false,
            currentUser: null,
            displaySwitchedNotif: [],
            displayedContacts: []
        }
        this.currentUserName = localStorage.getItem(LoginString.Name);
        this.currentUserid = localStorage.getItem(LoginString.ID);
        this.currentUserPhoto = localStorage.getItem(LoginString.PhotoUrl);
        this.currentUserMessages = [];
        this.searchUsers=[];
        this.notifMessageErrase= [];
        this.currentUserDocId = localStorage.getItem(LoginString.FirebaseDocumentId);
        this.onProfileClick = this.onProfileClick.bind(this);
        this.getListUser = this.getListUser.bind(this);
        this.renderListUser = this.renderListUser.bind(this);
        this.getClassNameOfUser = this.getClassNameOfUser.bind(this);
        this.notificationErase = this.notificationErase.bind(this);
        this.updateRenderList = this.updateRenderList.bind(this);
    }

    logout = () => {
        firebase.auth().signOut();
        this.props.history.push('/');
        localStorage.clear();
    }

    onProfileClick = () => {
        this.props.history.push('/profile');
    }

    componentDidMount() {
        firebase.firestore().collection("users").doc(this.currentUserDocId).get()
        .then((doc)=> {
            doc.data().messages.map((item) => {
                this.currentUserMessages.push({
                    notificationId: item.notificationId,
                    number: item.number
                })
            })

            this.setState({
                displaySwitchedNotif: this.currentUserMessages
            })
        })

        this.getListUser();
    }

    getListUser = async() => {
        const result = await firebase.firestore().collection("users").get();
        if(result.docs.length > 0){
            let listUsers = [];
            listUsers = [...result.docs]
            listUsers.forEach((item, index) => {
                this.searchUsers.push({
                    key: index,
                    documentKey: item.id,
                    id: item.data().id,
                    name: item.data().name,
                    messages: item.data().messages,
                    URL: item.data().URL,
                    description: item.data().description
                })
            })
            this.setState({
                isLoading: false
            })
        }
        this.renderListUser()
    }

    getClassNameOfUser = (itemId) => {
        let number = 0;
        let className = ""
        let check = false
        if(this.state.currentUser && this.state.currentUser.id === itemId) {
            className="viewWrapItemFocused"
        } else {
            this.state.displaySwitchedNotif.forEach((item) => {
                if(item.notificationId.length > 0) {
                    if(item.notificationId === itemId) {
                        check = true;
                        number = item.number;
                    }
                }
            })

            if(check === true) {
                className="viewWrapItemNotification";
            } else {
                className="viewWrapItem";
            }
        }
        return className;
    }

    notificationErase = (itemId) => {
        this.state.displaySwitchedNotif.forEach((item) => {
            if(item.notificationId.length > 0) {
                if(item.notificationId != itemId) {
                    this.notifMessageErrase.push({
                        notificationId: item.notificationId,
                        number: item.number
                    })
                }
            }
        })

        this.updateRenderList()
    }

    updateRenderList = () => {
        firebase.firestore().collection("users").doc(this.currentUserDocId).update(
            {messages: this.notifMessageErrase}
        )
        this.setState({
            displaySwitchedNotif: this.notifMessageErrase
        })
    }

    renderListUser = () => {
        if(this.searchUsers.length> 0) {
            let viewListUser = [];
            let classname = "";
            this.searchUsers.map((item) => {
                if(item.id !== this.currentUserid) {
                    classname = this.getClassNameOfUser(item.id)
                    viewListUser.push(
                        <button id={item.key}
                        className={classname}
                        onClick={() => {this.notificationErase(item.id)
                        this.setState({currentUser: item})
                        document.getElementById(item.key).style.backgroundColor = "#fff"
                        document.getElementById(item.key).style.color="#fff"
                        }}>
                            <img className="viewAvatarItem" src={item.URL} alt=""/>
                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {item.name}
                                </span>
                            </div>
                            {classname === "viewWrapItemNotification"?
                            <div className='notificationparagraph'>
                                <p id={item.key} className="newmessages">New Messages</p>
                            </div>: null}
                            
                        </button>
                    )
                }
            })
            this.setState({
                displayedContacts: viewListUser
            })
        } else {
            console.log("No User Detected");
        }
    }

    onSearchHandler = (event) => {
        let searchQuery = event.target.value.toLowerCase(),
        displayedContacts = this.searchUsers.filter((el) => {
            let SearchValue = el.name.toLowerCase();
            return SearchValue.indexOf(searchQuery) !== -1;
        })

        this.displayedContacts = displayedContacts
        this.displaySeacrhedContacts()
    }

    displaySeacrhedContacts = () => {
        if(this.searchUsers.length> 0) {
            let viewListUser = [];
            let classname = "";
            this.displayedContacts.map((item) => {
                if(item.id !== this.currentUserid) {
                    classname = this.getClassNameOfUser(item.id)
                    viewListUser.push(
                        <button id={item.key}
                        className={classname}
                        onClick={() => {this.notificationErase(item.id)
                        this.setState({currentUser: item})
                        document.getElementById(item.key).style.backgroundColor = "#fff"
                        document.getElementById(item.key).style.color="#fff"
                        }}>
                            <img className="viewAvatarItem" src={item.URL} alt=""/>
                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {item.name}
                                </span>
                            </div>
                            {classname === "viewWrapItemNotification"?
                            <div className='notificationparagraph'>
                                <p id={item.key} className="newmessages">New Messages</p>
                            </div>: null}
                            
                        </button>
                    )
                }
            })
            this.setState({
                displayedContacts: viewListUser
            })
        } else {
            console.log("No User Detected");
        }
    }

    render() {
        return (
            <div className="root">
                <div className="body">
                    <div className="userViewList">
                        <div className="profileviewleftside">
                            <img className="ProfilePicture" alt="" src={this.currentUserPhoto} onClick={this.onProfileClick}/>
                            <button className="Logout" onClick={this.logout}>Log out</button>
                        </div>
                        <div className="rootsearchbar">
                            <div className="input-container">
                                <input className="input-field" type="text" onChange={this.onSearchHandler} placeholder="Search"/>
                            </div>
                        </div>
                        {this.state.displayedContacts}
                    </div>
                    <div className="viewBoard">
                        {this.state.currentUser? (
                            <ChatBox currentUser={this.state.currentUser} showToast={this.props.showToast}/>
                        ): (
                            <WelcomeBoard currentUserName={this.currentUserName} currentUserPhoto={this.currentUserPhoto}/>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}
