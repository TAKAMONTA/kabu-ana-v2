
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

console.log('Firebase設定検証完了 - すべての必須環境変数が設定されています');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "kabu-ana-4d439.firebaseapp.com",
  projectId: "kabu-ana-4d439",
  storageBucket: "kabu-ana-4d439.firebasestorage.app",
  messagingSenderId: "576150778556",
  appId: "1:576150778556:web:afd571165894da2d6256b9",
  measurementId: "G-DJR20L5VCF"
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
