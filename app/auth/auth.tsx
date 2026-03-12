import { createContext, useContext } from "react";
import type { UserInfo } from "~/session/session.server";

type AuthContextValue = {
  user: UserInfo | null;
};

const AuthContext = createContext<AuthContextValue>({ user: null });

export function AuthProvider({
  user,
  children,
}: {
  user: UserInfo | null;
  children: React.ReactNode;
}) {
  return <AuthContext value={{ user }}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}