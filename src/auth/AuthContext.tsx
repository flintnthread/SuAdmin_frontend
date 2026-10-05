import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../lib/api";
import { clearSession, loadSession, saveSession, type Session } from "../lib/session";
import { fetchMe, login } from "../lib/superAdminApi";
import type { AdminUser } from "../lib/types";

type AuthContextValue = {
  admin: AdminUser | null;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(signOut, Math.max(session.expiresAt - Date.now(), 0));
    return () => window.clearTimeout(timer);
  }, [session, signOut]);

  // Refresh the profile once on load so a renamed or removed account is picked up.
  useEffect(() => {
    if (!loadSession()) return;
    fetchMe()
      .then((admin) => {
        const current = loadSession();
        if (!current) return;
        const next = { ...current, admin };
        saveSession(next);
        setSession(next);
      })
      .catch(() => {
        // A 401 already signs out through the unauthorized handler; other errors keep the cached profile.
      });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await login(email, password);
    const next: Session = {
      token: response.accessToken,
      expiresAt: Date.now() + response.expiresInSeconds * 1000,
      admin: response.admin,
    };
    saveSession(next);
    setSession(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin: session?.admin ?? null,
      isSignedIn: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
