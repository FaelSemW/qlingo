import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD_CfmtdF3Ywh5Jrd3Bl0FJRdb-bEmJMag",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "qlingo-73f77.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "qlingo-73f77",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "qlingo-73f77.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "705284091111",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:705284091111:web:9abfa3882424c6128dc642",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-84WEPVKBP1"
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (err) {
    console.warn('[Firebase] Erro ao inicializar SDK:', err);
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('CONFIG_MISSING');
  }
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return {
    idToken,
    email: user.email,
    name: user.displayName,
    avatar: user.photoURL,
    uid: user.uid
  };
}

export async function logoutFirebase() {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
  }
}
