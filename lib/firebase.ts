import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBpifHGkpr7ev4y3SqsxlXS_lLZ2UnzpM",
  authDomain: "myfolio-tag.firebaseapp.com",
  projectId: "myfolio-tag",
  storageBucket: "myfolio-tag.firebasestorage.app",
  messagingSenderId: "360310061063",
  appId: "1:360310061063:web:ca662aa6e0dc89cfd6d2a2"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Exportation des services pour l'application
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);