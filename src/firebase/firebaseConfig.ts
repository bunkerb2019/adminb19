import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// 🔥 Твой конфиг Firebase (замени своими данными)
const firebaseConfig = {
  apiKey: "AIzaSyB5GAgKVh-Y5tnB7LZ9lYXe-EZT2VKtnYc",
  authDomain: "bunkerb19-79795.firebaseapp.com",
  projectId: "bunkerb19-79795",
  storageBucket: "bunkerb19-79795.firebasestorage.app",
  messagingSenderId: "334546820539",
  appId: "1:334546820539:web:089ec2418bd05ce82f389e",
  measurementId: "G-HX219PQD6Z"
};


// Инициализация Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);