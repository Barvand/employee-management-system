import React, { createContext, useEffect, useMemo, useState } from "react";
import { makeRequest } from "../../axios";

export type User = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: "admin" | "employee" | "accountant";
};

type Credentials = { email: string; password: string };

type AuthContextType = {
  currentUser: User | null;
  login: (payload: Credentials) => Promise<User>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const login = async (payload: Credentials): Promise<User> => {
    const { data } = await makeRequest.post<User>("/auth/login", payload);
    setCurrentUser(data);
    return data;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser));
    else localStorage.removeItem("user");
  }, [currentUser]);

  const value = useMemo(() => ({ currentUser, login, logout }), [currentUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
