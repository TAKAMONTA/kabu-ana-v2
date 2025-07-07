
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCjoPuMqT7LC6Wo9Bj_TqOsKIUYVfg8mpY",
  authDomain: "kabuanacom.firebaseapp.com",
  projectId: "kabuanacom",
  storageBucket: "kabuanacom.firebasestorage.app",
  messagingSenderId: "56179287169",
  appId: "1:56179287169:web:a9c872e0498c59b3509980",
  measurementId: "G-M0PT244D3Q"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup };

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
