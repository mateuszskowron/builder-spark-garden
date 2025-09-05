import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@/models/types";
import { getCurrentUser, login as doLogin, logout as doLogout, setCurrentUser, updateProfileName } from "@/controllers/authController";

interface AuthContextProps {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const value = useMemo(
    () => ({
      user,
      login: async (email: string, password: string) => {
        const u = await doLogin(email, password);
        if (u) {
          setUser(u);
          setCurrentUser(u);
          return true;
        }
        return false;
      },
      logout: async () => {
        await doLogout();
        setUser(null);
        setCurrentUser(null);
      },
      updateName: async (name: string) => {
        const updated = await updateProfileName(name);
        if (updated) {
          setUser(updated);
          return true;
        }
        return false;
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
