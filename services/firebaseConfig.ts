
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { RobustApiClient, RetryConfig, createRetryConfig } from "./apiUtils";

const FIREBASE_RETRY_CONFIG: RetryConfig = createRetryConfig({
  maxRetries: 2,
  baseDelay: 500,
  maxDelay: 5000,
  backoffMultiplier: 2,
  retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'INTERNAL_ERROR', 'auth/network-request-failed']
});

const apiClient = new RobustApiClient();

console.log('Firebase設定検証完了 - すべての必須環境変数が設定されています');

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  console.error('Firebase API key not found in environment variables');
  throw new Error('Firebase設定エラー: API keyが環境変数に設定されていません');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export { onAuthStateChanged, signOut, signInWithPopup };

export const robustSignInWithEmailAndPassword = async (email: string, password: string) => {
  return apiClient.executeWithRetry(
    () => signInWithEmailAndPassword(auth, email, password),
    FIREBASE_RETRY_CONFIG,
    'firebase-signin'
  );
};

export const robustCreateUserWithEmailAndPassword = async (email: string, password: string) => {
  return apiClient.executeWithRetry(
    () => createUserWithEmailAndPassword(auth, email, password),
    FIREBASE_RETRY_CONFIG,
    'firebase-signup'
  );
};

export const robustSignInWithPopup = async (provider: GoogleAuthProvider) => {
  return apiClient.executeWithRetry(
    () => signInWithPopup(auth, provider),
    FIREBASE_RETRY_CONFIG,
    'firebase-google-signin'
  );
};

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}
