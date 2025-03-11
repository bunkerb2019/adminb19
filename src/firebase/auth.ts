import { auth, provider } from "../firebase/firebaseConfig"; 
import { signInWithPopup, signOut } from "firebase/auth";

// Вход через Google
export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
    console.log("Пользователь вошел:", auth.currentUser);
  } catch (error) {
    console.error("Ошибка при входе:", error);
  }
};

// Выход из системы
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("Пользователь вышел");
  } catch (error) {
    console.error("Ошибка при выходе:", error);
  }
};