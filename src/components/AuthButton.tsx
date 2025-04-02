import { loginWithGoogle, logout } from "../firebase/auth";
import { useAuth } from "../providers/AuthProvider";

const AuthButton = () => {
  const { user } = useAuth();

  return (
    <button onClick={user ? logout : loginWithGoogle}>
      {user ? "Выйти" : "Войти через Google"}
    </button>
  );
};

export default AuthButton;