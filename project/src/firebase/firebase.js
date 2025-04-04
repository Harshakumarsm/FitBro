// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCaU719DlD3guoCbWFIx_VBkjdqiXl1pPs",
  authDomain: "fitbro-887cc.firebaseapp.com",
  projectId: "fitbro-887cc",
  storageBucket: "fitbro-887cc.firebasestorage.app",
  messagingSenderId: "735268678150",
  appId: "1:735268678150:web:6ec15b87555e2d18463187",
  measurementId: "G-3JCDNX8W34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth,app };