// src/firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDIsDpNF5VmFIGbPgl-S_Jyj4cxYpHEgBk",
  authDomain: "chic-vault.firebaseapp.com",
  databaseURL: "https://chic-vault-default-rtdb.firebaseio.com",
  projectId: "chic-vault",
  storageBucket: "chic-vault.appspot.com",
  messagingSenderId: "608714410865",
  appId: "1:608714410865:web:e83c01ace70ca7db8784d0",
  measurementId: "G-MQVHBXQTRZ",
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();
const storage = firebase.storage();

export { database, storage };
