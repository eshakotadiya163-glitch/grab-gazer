import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USERS_KEY = "twc-users";
const SESSION_KEY = "twc-session";

function readUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const signup = useCallback<AuthContextValue["signup"]>(async (name, email, password) => {
    const normalized = email.trim().toLowerCase();
    if (!name.trim()) return { ok: false, error: "Name required" };
    if (!normalized.includes("@")) return { ok: false, error: "Valid email required" };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
    const users = readUsers();
    if (users.some((u) => u.email === normalized)) {
      return { ok: false, error: "An account with this email already exists" };
    }
    const newUser: StoredUser = { id: crypto.randomUUID(), name: name.trim(), email: normalized, password };
    writeUsers([...users, newUser]);
    const session: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    const normalized = email.trim().toLowerCase();
    const users = readUsers();
    const found = users.find((u) => u.email === normalized && u.password === password);
    if (!found) return { ok: false, error: "Invalid email or password" };
    const session: AuthUser = { id: found.id, name: found.name, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, hydrated, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
