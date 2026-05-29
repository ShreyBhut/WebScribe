// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDATANKpugNx-r1vrKKqf0BE3CBczCB2Nk",
  authDomain: "webscribe-b2bc3.firebaseapp.com",
  projectId: "webscribe-b2bc3",
  storageBucket: "webscribe-b2bc3.firebasestorage.app",
  messagingSenderId: "430266673851",
  appId: "1:430266673851:web:dd9c9e86a58bbbfd0e979e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export it so other files can use it
export const db = getFirestore(app);