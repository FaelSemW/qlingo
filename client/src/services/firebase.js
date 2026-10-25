import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== '' &&
  !firebaseConfig.apiKey.includes('SUA_API_KEY') &&
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
