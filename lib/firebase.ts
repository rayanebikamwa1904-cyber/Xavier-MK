import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBpifHGkpr7ev4y3SqsxlXS_lLZ2UnzpM",
  authDomain: "myfolio-tag.firebaseapp.com",
  projectId: "myfolio-tag",
  storageBucket: "myfolio-tag.firebasestorage.app",
  messagingSenderId: "360310061063",
  appId: "1:360310061063:web:ca662aa6e0dc89cfd6d2a2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
