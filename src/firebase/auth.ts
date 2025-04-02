import { auth, provider } from "./firebaseConfig";
import { signInWithPopup, signOut } from "firebase/auth";

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Ошибка при входе:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Ошибка при выходе:", error);
    throw error;
  }
};