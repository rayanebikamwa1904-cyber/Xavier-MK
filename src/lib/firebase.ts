import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: 'AIzaSyDBpifHGkpr7ev4y3SqsxlXS_lLZ2UnzpM',
  authDomain: 'myfolio-tag.firebaseapp.com',
  projectId: 'myfolio-tag',
  storageBucket: 'myfolio-tag.firebasestorage.app',
  messagingSenderId: '360310061063',
  appId: '1:360310061063:web:ca662aa6e0dc89cfd6d2a2'
};

let app: any;
let db: any;
let auth: any;
let firebaseInitializationError: Error | null = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error: any) {
  console.error("Firebase initialization failed:", error);
  firebaseInitializationError = error;
  // Export null or dummy objects to prevent crashes in dependent modules
  app = null;
  db = null;
  auth = null;
}

export { db, auth, firebaseInitializationError };
