import React, {Component} from "react";
import "./ChatBox.css";
import {Card} from "react-bootstrap";
import ReactLoading from "react-loading";
import 'react-toastify/dist/ReactToastify.css';
import firebase from "../../Services/firebase";
import images from "../../ProjectImages/ProjectImages";
import LoginString from "../Login/LoginStrings";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";

 export default class ChatBox extends Component {
     constructor(props) {
         super(props);
         this.state = {
             isLoading: false,
             isShowSticker: false
         }
        this.currentUserName = localStorage.getItem(LoginString.Name);
        this.currentUserid = localStorage.getItem(LoginString.ID);
        this.currentUserPhoto = localStorage.getItem(LoginString.PhotoUrl);
        this.currentUserDocId = localStorage.getItem(LoginString.FirebaseDocumentId);
        this.stateChanged = localStorage.getItem(LoginString.UPLOAD_CHANGED);
        this.currentUser = this.props.currentUser;
        this.groupChatId = null;
        this.listMessages = []
        this.removeListener = null;
        this.currentPhotoFile = null;
        this.currentOppUserMessages = []
        firebase.firestore().collection("users").doc(this.currentUser.documentKey).get()
        .then((docRef) => {
            this.currentOppUserMessages = docRef.data().messages
        })
     }

     componentDidUpdate() {
         this.scrollToBottom()
     }

     componentWillReceiveProps(newProps) {
         if(newProps.currentUser) {
             this.currentUser = newProps.currentUser;
             this.getListHistory();
         }
     }

     componentDidMount() {
         this.getListHistory();
     }

     componentWillUnmount() {
         if(this.removeListener) {
             this.removeListener()
         }
     }

     getListHistory = () => {
        if(this.removeListener) {
            this.removeListener()
        }
         this.listMessages.length = 0;
         this.setState({isLoading: true})
         if(
             this.hashString(this.currentUserid) <= 
             this.hashString(this.currentUser.id)
             ) {
             this.groupChatId = `${this.currentUserid} - ${this.currentUser.id}`
         } else {
            this.groupChatId = `${this.currentUser.id} - ${this.currentUserid}`
         }

         this.removeListener = firebase.firestore()
         .collection('Messages')
         .doc(this.groupChatId)
         .collection(this.groupChatId)
         .onSnapshot(snapshot => {
             snapshot.docChanges().forEach(change => {
                 if(change.type === LoginString.DOC) {
                     this.listMessages.push(change.doc.data())
                 }
             })
             this.setState({isLoading: false})
         },
         err => {
             this.props.showToast(0, err.toString())
         }
         )
        }

     onSendMessage = (content, type) => {
         let notificationMessages = []
         if(this.state.isShowSticker && type === 2) {
             this.setState({isShowSticker: false})
         }

         if(content.trim === "") {
             return
         }

         const timestamp = moment()
         .valueOf()
         .toString()

         const itemMessage = {
             idFrom: this.currentUserid,
             idTo: this.currentUser.id,
             timestamp: timestamp,
             content: content.trim(),
             type: type
         }

         firebase.
         firestore()
         .collection("Messages")
         .doc(this.groupChatId)
         .collection(this.groupChatId)
         .doc(timestamp)
         .set(itemMessage)
         .then(() => {
             this.setState({inputValue: ""})
         })

         this.currentOppUserMessages.map((item) => {
             if(item.notificationId != this.currentUserid) {
                 notificationMessages.push(
                     {
                         notificationId: item.notificationId,
                         number: item.number
                     }
                 )
             }
         })

         firebase.firestore()
         .collection("users")
         .doc(this.currentUser.documentKey)
         .update({
             messages: notificationMessages
         })
         .then((data) => {})
         .catch(err=> {
             this.props.showToast(0, err.toString())
         })
     }

     scrollToBottom = () => {
         if(this.messagesEnd) {
             this.messagesEnd.scrollIntoView({})
         }
     }

     onKeyboardPress = event => {
         if(event.key === 'Enter') {
             this.onSendMessage(this.state.inputValue, 0)
         }
     }

     openStickerList = () => {
         this.setState({isShowSticker: !this.state.isShowSticker})
     }

     render() {
         return(
             <Card className="viewChatBoard">
                 <div className="headerChatBoard">
                    <img className="viewAvatarItem" src={this.currentUser.URL} alt=""/>
                    <span className="textHeaderChatBoard">
                        <p style={{fontSize: '20px'}}>{this.currentUser.name}</p>
                    </span>
                 
                 <div className="aboutme">
                    <span className="textHeaderChatBoard">
                        <p>{this.currentUser.description}</p>
                    </span>
                 </div>
                 </div>
                 <div className="viewListContentChat">
                     {this.renderListMessage()}
                     <div style={{float: 'left', clear: 'both'}}
                     ref={el=> {
                         this.messagesEnd = el
                     }}
                     />
                 </div>

                 {this.state.isShowSticker? this.renderSticker(): null}

                 <div className="viewBottom">
                     <img 
                     className="icOpenGallery" 
                     src={images.input_file} 
                     alt="Input File" 
                     onClick={()=> {this.refInput.click()}}
                     />
                     <input
                     ref={el => {
                         this.refInput = el
                     }}
                     className="viewInputGallery" 
                     accept="image/*" 
                     type="file" 
                     onChange={this.onChoosePhoto}
                     />
                     <img 
                     className="icOpenSticker" 
                     src={images.sticker} 
                    alt="Stickers" 
                    onClick={this.openStickerList}
                    />
                     <input className="viewInput" 
                     placeholder="Type a Message" 
                     value={this.state.inputValue} 
                     onChange={event=> {
                         this.setState({inputValue: event.target.value})
                     }} 
                     onKeyPress={this.onKeyboardPress}
                     />

                     <img className="icSend" 
                     src={images.send} 
                     alt="Send" 
                     onClick={() => {this.onSendMessage(this.state.inputValue, 0)}}
                     />

                     {this.state.isLoading? (
                         <div className="viewLoading">
                             <ReactLoading
                             type={"spin"}
                             color={"#203152"}
                             height={"3%"}
                             width={"3%"}/>
                         </div>
                     ): null}

                 </div>
             </Card>
         )
     }

     onChoosePhoto = (event) => {
         if(event.target.files && event.target.files[0]) {
             this.setState({isLoading: true})
             this.currentPhotoFile = event.target.files[0]
             const prefixType = event.target.files[0].type.toString()
             if(prefixType.indexOf('image/') === 0) {
                 this.uploadPhoto()
             } else {
                 this.setState({isLoading: false})
                 this.props.showToast(0, "This file is not an image")
             }
         } else {
             this.setState({isLoading: false})
         }
     }

     uploadPhoto = () => {
         if(this.currentPhotoFile) {
             const timestamp = moment()
             .valueOf()
             .toString()

             const uploadTask = firebase.storage()
             .ref()
             .child(timestamp)
             .put(this.currentPhotoFile)

             uploadTask.on(
                 LoginString.UPLOAD_CHANGED,
                 null,
                 err => {
                     this.setState({isLoading: false})
                     this.props.showToast(0, err.message)
                 },
                 () => {
                     uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                         this.setState({isLoading: false})
                         this.onSendMessage(downloadURL, 1)
                     })
                 }
             )
         } else {
             this.setState({isLoading: false})
             this.props.showToast(0, "File is null")
         }
     }
     renderListMessage = () => {
         if(this.listMessages.length > 0) {
             let viewListMessage = [];
             this.listMessages.forEach((item, index) => {
                 if(item.idFrom === this.currentUserid) {
                     if(item.type === 0) {
                         viewListMessage.push(
                             <div className="viewItemRight" key={item.timestamp}>
                                 <span className="textContentItem">{item.content}</span>
                             </div>
                         )
                     } else if(item.type === 1) {
                        viewListMessage.push(
                            <div className="viewItemRight2" key={item.timestamp}>
                                <img
                                className="imgItemRight"
                                src={item.content}
                                alt="Update Your Image"/>
                            </div>
                        )
                     } else {
                         viewListMessage.push(
                             <div className="viewItemRight3" key={item.timestamp}>
                                 <img className="imgItemRight"
                                 src={this.getGifImage(item.content)}
                                 alt="content message"/>
                             </div>
                         )
                     }
                 } else {
                     if(item.type===0) {
                         viewListMessage.push(
                             <div className="viewWrapItemLeft" key={item.timestamp}>
                                 <div className="viewWrapItemLeft3">
                                     {this.isLastMessageLeft(index)? (
                                         <img src={this.currentUser.URL}
                                         alt=""
                                         className="perrAvatarLeft" />
                                     ): (
                                         <div className="viewPaddingLeft"/>
                                     )}
                                     <div className="viewItemLeft">
                                     <span className="textContentItem">{item.content}</span>
                                     </div>
                                 </div>
                                 {this.isLastMessageLeft(index)? (
                                     <span className="textTimeLeft">
                                         <div className="time">
                                             {moment(Number(item.timestamp)).format('11')}
                                         </div>
                                     </span>
                                 ): null}
                             </div>
                         )
                     } else if(item.type === 1) {
                        viewListMessage.push(
                            <div className="viewWrapItemLeft2" key={item.timestamp}>
                                <div className="viewWrapItemLeft3">
                                    {this.isLastMessageLeft(index)? (
                                        <img src={this.currentUser.URL}
                                        alt=""
                                        className="perrAvatarLeft" />
                                    ): (
                                        <div className="viewPaddingLeft"/>
                                    )}
                                    <div className="viewItemLeft2">
                                        <img 
                                        src={item.content} 
                                        alt="" 
                                        className="imgItemLeft"
                                        />
                                    </div>
                                </div>
                                {this.isLastMessageLeft(index)? (
                                     <span className="textTimeLeft">
                                         <div className="time">
                                             {moment(Number(item.timestamp)).format('11')}
                                         </div>
                                     </span>
                                 ): null}
                            </div>
                        )
                     } else {
                         viewListMessage.push(
                            <div className="viewWrapItemLeft2" key={item.timestamp}>
                                <div className="viewWrapItemLeft3">
                                    {this.isLastMessageLeft(index)? (
                                        <img src={this.currentUser.URL}
                                        alt="avatar"
                                        className="perrAvatarLeft" />
                                    ): (
                                        <div className="viewPaddingLeft"/>
                                    )}
                                    <div className="viewItemLeft3" key={item.timestamp}>
                                        <img
                                        className="imgItemRight"
                                        src={item.content}
                                        alt="Update Your Image"/>
                                    </div>
                                </div>
                                {this.isLastMessageLeft(index)? (
                                     <span className="textTimeLeft">
                                         <div className="time">
                                             {moment(Number(item.timestamp)).format('11/2')}
                                         </div>
                                     </span>
                                 ): null}
                            </div>
                         )
                     }
                 }
             })
             return viewListMessage
         } else {
             return(
                 <div className="viewWrapSayHi">
                     <span className="textSayHi">Say Hi To New People!</span>
                     <img className="imgWaveHand" src={images.wave_hand} alt="wave hand"/>
                 </div>
             )
         }
     }
     renderSticker = () => {
         return(
             <div className="viewStickers">
                <img 
                 className="imgSticker" 
                 src={images.teddy1} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy1", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy2} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy2", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy3} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy3", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy4} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy4", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy5} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy5", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy6} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy6", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy7} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy7", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy8} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy8", 2)}}
                 />

                <img 
                 className="imgSticker" 
                 src={images.teddy9} 
                 alt="stickers" 
                 onClick={()=> {this.onSendMessage("teddy9", 2)}}
                 />
             </div>
         )
        }


        hashString = str => {
            let hash = 0;
            for(let i=0; i< str.length; i++) {
                hash += Math.pow(str.charCodeAt(i) * 31, str.length -i)
                hash = hash & hash // convert to 32 bit integer
            }
            return hash
        }

        getGifImage = (value) => {
            switch(value) {
                case 'teddy1':
                    return images.teddy1
                case 'teddy2':
                    return images.teddy2
                case 'teddy3':
                    return images.teddy3
                case 'teddy4':
                    return images.teddy4
                case 'teddy5':
                    return images.teddy5
                case 'teddy6':
                    return images.teddy6
                case 'teddy7':
                    return images.teddy7
                case 'teddy8':
                    return images.teddy8
                case 'teddy9':
                    return images.teddy9
            }
        }

        isLastMessageLeft(index) {
            if((index+1 < this.listMessages.length && this.listMessages[index +1].idFrom === this.currentUserid) || 
            index === this.listMessages.length -1) {
                return true;
            } else {
                return false;
            }
        }

        isLastMessageRight(index) {
            if((index+1 < this.listMessages.length && this.listMessages[index +1].idFrom !== this.currentUserid) || 
            index === this.listMessages.length -1) {
                return true;
            } else {
                return false;
            }
        }
 }