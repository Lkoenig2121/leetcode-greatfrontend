"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { PublicUser } from "@/lib/types";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  requireAuth,
}: {
  children: React.ReactNode;
  requireAuth: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch((err: unknown) => {
        if (!cancelled) setUser(null);
        if (requireAuth && err instanceof ApiError && err.status === 401) {
          router.replace("/");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requireAuth, router]);

  const login = useCallback(
    async (userId: string) => {
      const me = await api.login(userId);
      setUser(me);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    router.replace("/");
  }, [router]);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  if (requireAuth && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
