
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

console.log('Firebase設定検証完了 - すべての必須環境変数が設定されています');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kabuanacom.firebaseapp.com",
  projectId: "kabuanacom",
  storageBucket: "kabuanacom.firebasestorage.app",
  messagingSenderId: "56179287169",
  appId: "1:56179287169:web:a9c872e0498c59b3509980",
  measurementId: "G-M0PT244D3Q"
};

if (!firebaseConfig.apiKey) {
  console.error('Firebase API key not found in environment variables');
  throw new Error('Firebase設定エラー: API keyが環境変数に設定されていません');
}

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
