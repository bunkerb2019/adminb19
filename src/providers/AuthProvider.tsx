import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useAdminSettings } from "../hooks/useAdminSettings";

interface AuthContextType {
  user: User | undefined;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
  isAdmin: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: adminSettings } = useAdminSettings();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user ?? undefined);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email && adminSettings) {
      setIsAdmin(adminSettings.ownerEmail?.includes(user.email) ?? false);
    } else {
      setIsAdmin(false);
    }
  }, [user, adminSettings]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
