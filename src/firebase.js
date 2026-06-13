// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI83hBSjWBd_OqQFggS7XsfmMOmIMtmsQ",
  authDomain: "mundial-prueba.firebaseapp.com",
  projectId: "mundial-prueba",
  storageBucket: "mundial-prueba.firebasestorage.app",
  messagingSenderId: "60784684576",
  appId: "1:60784684576:web:91c6af53ec4bd20e109645"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);