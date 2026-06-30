import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User as SupaUser } from "@supabase/supabase-js";

export interface AuthUser { id: string; name: string; email: string; }

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  roles: string[];
  isAdmin: boolean;
  isVendor: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(u: SupaUser | null | undefined): AuthUser | null {
  if (!u) return null;
  const name = (u.user_metadata?.full_name as string) || (u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "");
  return { id: u.id, name, email: u.email ?? "" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const fetchRoles = useCallback(async (uid: string | undefined) => {
    if (!uid) { setRoles([]); return; }
    const { data } = await supabase.from("user_roles" as never).select("role").eq("user_id", uid);
    setRoles((data ?? []).map((r: { role: string }) => r.role));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setTimeout(() => { void fetchRoles(s?.user?.id); }, 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void fetchRoles(data.session?.user?.id).finally(() => setHydrated(true));
    });
    return () => sub.subscription.unsubscribe();
  }, [fetchRoles]);

  const login = useCallback<AuthContextValue["login"]>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signup = useCallback<AuthContextValue["signup"]>(async (name, email, password) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: redirectUrl, data: { full_name: name.trim() } },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { lovable } = await import("@/integrations/lovable/index");
    await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setRoles([]);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: toAuthUser(session?.user),
    session,
    roles,
    isAdmin: roles.includes("admin"),
    isVendor: roles.includes("vendor"),
    hydrated,
    login,
    signup,
    signInWithGoogle,
    logout,
    refreshRoles: () => fetchRoles(session?.user?.id),
  }), [session, roles, hydrated, login, signup, signInWithGoogle, logout, fetchRoles]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
