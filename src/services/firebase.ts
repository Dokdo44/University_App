import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// ------------------------------------------------------------------
// Auth helpers
// ------------------------------------------------------------------
export const authService = {
  login: (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password),

  register: (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password),

  logout: () => signOut(auth),

  onAuthChange: (cb: (user: User | null) => void) =>
    onAuthStateChanged(auth, cb),

  currentUser: () => auth.currentUser,
};
