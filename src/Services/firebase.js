import React from "react";
import * as firebase from "firebase";

var firebaseConfig = {
    apiKey: "AIzaSyAmbGuenTMbsBwMm3wHioKQ4lN3pOdmt5g",
    authDomain: "webchatapp-97aed.firebaseapp.com",
    databaseURL: "https://webchatapp-97aed.firebaseio.com",
    projectId: "webchatapp-97aed",
    storageBucket: "webchatapp-97aed.appspot.com",
    messagingSenderId: "451717748054",
    appId: "1:451717748054:web:a04af2b5baa7ef7b8ff2f7"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase;