import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthValue {
  /** null once resolved and signed out; undefined while still resolving. */
  session: Session | null;
  roles: AppRole[];
  /** True until the session and roles have been resolved on the client. */
  loading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRoles(userId: string | undefined) {
      if (!userId) {
        if (active) setRoles([]);
        return;
      }
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (!active) return;
      setRoles(error || !data ? [] : data.map((row) => row.role));
    }

    // Listener first, so a token refresh during the initial getSession() is not missed.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      // Supabase warns against awaiting its own client inside this callback.
      setTimeout(() => {
        void loadRoles(nextSession?.user.id).finally(() => {
          if (active) setLoading(false);
        });
      }, 0);
    });

    void supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!active) return;
        setSession(data.session);
        await loadRoles(data.session?.user.id);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return {
        error:
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message,
      };
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRoles([]);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      roles,
      loading,
      isStaff: roles.length > 0,
      isAdmin: roles.includes("admin"),
      email: session?.user.email ?? null,
      signIn,
      signOut,
    }),
    [session, roles, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  }
  return value;
}
