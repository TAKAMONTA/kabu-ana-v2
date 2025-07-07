
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCd_SZvlUlrYyjD24aczZc8J_zzzu0uwv8",
  authDomain: "kabu-ana-4d439.firebaseapp.com",
  projectId: "kabu-ana-4d439",
  storageBucket: "kabu-ana-4d439.firebasestorage.app",
  messagingSenderId: "576150778556",
  appId: "1:576150778556:web:afd571165894da2d6256b9",
  measurementId: "G-DJR20L5VCF"
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
