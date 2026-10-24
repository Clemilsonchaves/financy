import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Q, User, clearToken, getToken, gql, setToken } from "./api";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
};

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!getToken());

  const signOut = () => {
    clearToken();
    setUser(null);
    qc.clear();
  };

  useEffect(() => {
    if (getToken()) {
      gql<{ me: User }>(Q.me)
        .then((d) => setUser(d.me))
        .catch(() => clearToken())
        .finally(() => setLoading(false));
    }
    window.addEventListener("financy:logout", signOut);
    return () => window.removeEventListener("financy:logout", signOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = (token: string, u: User) => {
    setToken(token);
    qc.clear();
    setUser(u);
  };

  return <Ctx.Provider value={{ user, loading, signIn, signOut }}>{children}</Ctx.Provider>;
}
