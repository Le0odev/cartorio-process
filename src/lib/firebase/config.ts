import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
  apiKey: "AIzaSyCCVloM2e1q1dk5-1py5IhDyXH5nbJZxQQ",
  authDomain: "cartorio-system.firebaseapp.com",
  projectId: "cartorio-system",
  storageBucket: "cartorio-system.firebasestorage.app",
  messagingSenderId: "209760367635",
  appId: "1:209760367635:web:79c9a68bf4db80e6a03be6"
  // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,

};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const functions = getFunctions(app);

export default app;