import { onAuthStateChanged, User } from "firebase/auth";
import { loginWithGoogle, logout } from "../firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useState } from "react";

const AuthButton = () => {

  const [user, setUser] = useState<User | undefined>()

  onAuthStateChanged(auth, (user) => {
    setUser(user ?? undefined)
  });
  

  return (
    <button onClick={user ? logout : loginWithGoogle}>
      {user ? "Выйти" : "Войти через Google"}
    </button>
  );
};

export default AuthButton;