// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjoPuMqT7LC6Wo9Bj_TqOsKIUYVfg8mpY",
  authDomain: "kabuanacom.firebaseapp.com",
  projectId: "kabuanacom",
  storageBucket: "kabuanacom.firebasestorage.app",
  messagingSenderId: "56179287169",
  appId: "1:56179287169:web:a9c872e0498c59b3509980",
  measurementId: "G-M0PT244D3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
