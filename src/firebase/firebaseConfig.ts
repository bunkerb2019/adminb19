import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// 🔥 Твой конфиг Firebase (замени своими данными)
const firebaseConfig = {
    apiKey: "AIzaSyBwes6yd-24ngRBBEaIs8SXGjd6Li86YbU",
    authDomain: "main-menu-e6ed6.firebaseapp.com",
    projectId: "main-menu-e6ed6",
    storageBucket: "main-menu-e6ed6.firebasestorage.app",
    messagingSenderId: "861499763984",
    appId: "1:861499763984:web:eb00ba63de7368ea3e8995",
    measurementId: "G-51DMHXXH1X"
  };

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);