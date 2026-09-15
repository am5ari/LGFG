// ================================
// LOOK GOOD FEEL GOOD LEXINGTON
// FIREBASE CONFIGURATION
// ================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


const firebaseConfig = {
    apiKey: "AIzaSyCNtIhSwOJlirgW5cTEbOTJAzG9t3RZaYM",
    authDomain: "look-good-feel-good-lex.firebaseapp.com",
    projectId: "look-good-feel-good-lex",
    storageBucket: "look-good-feel-good-lex.firebasestorage.app",
    messagingSenderId: "13904233382",
    appId: "1:13904233382:web:0fd19d085b527c00dc4567",
    measurementId: "G-400P5HSE4X"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


// Make them available to other files
export {
    app,
    auth,
    db,
    storage
};