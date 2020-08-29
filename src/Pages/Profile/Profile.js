import React from 'react';
import "./Profile.css";
import ReactLoading from "react-loading";
import 'react-toastify/dist/ReactToastify.css';
import firebase from "../../Services/firebase";
import LoginString from "../Login/LoginStrings";
import images from "../../ProjectImages/ProjectImages";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            documentKey: localStorage.getItem(LoginString.FirebaseDocumentId),
            id: localStorage.getItem(LoginString.ID),
            name: localStorage.getItem(LoginString.name),
            aboutMe: localStorage.getItem(LoginString.Description),
            photoUrl: localStorage.getItem(LoginString.PhotoUrl),
        }

        this.newPhoto = null;
        this.newPhotoUrl = ""
    }

    componentDidMount() {
        if(!localStorage.getItem(LoginString.ID)) {
            this.props.history.push("/")
        }
    }

    onChangeName = (event) => {
        this.setState({
            name: event.target.value
        })
    }

    onChaneAboutMe = (event) => {
        this.setState({
            aboutMe: event.target.value
        })
    }

    onChangeAvatar = (event) => {
        if(event.target.files && event.target.files[0]) {
            const prefixType = event.target.files[0].type.toString()
            if(prefixType.indexOf(LoginString.PREFIX_IMAGE) !== 0) {
                this.props.showToast(0, "This is not an image")
                return
            }
            this.newPhoto = event.target.files[0];
            this.setState({photoUrl: URL.createObjectURL(event.target.files[0])})
        } else {
            this.props.showToast(0, "Something is wrong with input file")
        }
    }

    uploadAvatar = () => {
        this.setState({isLoading: true})
        if(this.newPhoto) {
            const uploadTask = firebase.storage().ref().child(this.state.id).put(this.newPhoto)
            uploadTask.on(LoginString.UPLOAD_CHANGED, null, err=> {this.props.showToast(0, err.message)}, 
            ()=> {uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                this.updateUserInfo(true, downloadURL)
            })})
        } else {
            this.updateUserInfo(false, null)
        }
    }

    updateUserInfo = (isUpdatedPhotoUrl, downloadURL) => {
        let newInfo
        if(isUpdatedPhotoUrl) {
            newInfo = {
                name: this.state.name,
                description: this.state.aboutMe,
                URL: downloadURL
            }
        } else {
            newInfo = {
                name: this.state.name,
                description: this.state.aboutMe
            }
        }

        firebase.firestore().collection("users").doc(this.state.documentKey).update(newInfo).then(data=> {
            localStorage.setItem(LoginString.Name, this.state.name)
            localStorage.setItem(LoginString.Description, this.state.aboutMe)
            if(isUpdatedPhotoUrl) {
                localStorage.setItem(LoginString.PhotoUrl, downloadURL)
            }
            this.setState({isLoading: false})
            this.props.showToast(1, "Updated Info")
        })
    }

    render() {
        return (
            <div className="profileroot">
                <div className="headerprofile">
                    <span>PROFILE</span>
                </div>
                <img className="avatar" alt="" src={this.state.photoUrl}/>
                <div className="viewWrapInputFile">
                    <img className="imgInputFile" alt="icon gallery" src={images.chooseFile} onClick={()=> { this.refInput.click()}}/>
                    <input ref={el=> {this.refInput = el}} accept="image/*" className="viewInputFile" type="file" onChange={this.onChangeAvatar}/>
                </div>
                <span className="textLabel">Name</span>
                <input className="textInput"
                value={this.state.name? this.state.name: ""}
                placeholder="Your Name"
                onChange={this.onChangeName}/>
                <span className="textLabel">About Me</span>
                <input 
                className="textInput"
                value={this.state.aboutMe? this.state.aboutMe: ""}
                placeholder="About Yourself"
                onChange={this.onChaneAboutMe}
                />
                <div>
                    <button className="btnUpdate" onClick={this.uploadAvatar}>SAVE</button>
                    <button className="btnBack" onClick={()=> {this.props.history.push("/chat")}}>BACK</button>
                </div>
                {this.state.loading?(
                    <div>
                        <ReactLoading type={"spin"} color={"#203152"} height={"3%"} width={"3%"}/>
                    </div>
                ): null}
            </div>
        )
    }
    
}
