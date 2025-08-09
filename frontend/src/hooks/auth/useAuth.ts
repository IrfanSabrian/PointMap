import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { validateToken, setupAutoLogout } from "@/lib/auth";

type AuthInfo = {
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export function useAuth(onAutoLogout?: () => void) {
  const [auth, setAuth] = useState<AuthInfo>({
    token: null,
    isLoggedIn: false,
    isAdmin: false,
  });

  // Keep latest onAutoLogout without retriggering main effect
  const onAutoLogoutRef = useRef(onAutoLogout);
  useEffect(() => {
    onAutoLogoutRef.current = onAutoLogout;
  }, [onAutoLogout]);

  const readToken = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !validateToken(token)) {
        setAuth({ token: null, isLoggedIn: false, isAdmin: false });
        return null;
      }
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const isAdmin = Boolean(payload?.role === "admin" || payload?.isAdmin);
      setAuth({ token, isLoggedIn: true, isAdmin });
      return token;
    } catch {
      setAuth({ token: null, isLoggedIn: false, isAdmin: false });
      return null;
    }
  }, []);

  useEffect(() => {
    const token = readToken();
    if (token) {
      setupAutoLogout(token, () => {
        setAuth({ token: null, isLoggedIn: false, isAdmin: false });
        onAutoLogoutRef.current?.();
      });
    }
    // run once on mount (readToken is stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readToken]);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("token", token);
      readToken();
      setupAutoLogout(token, () => {
        setAuth({ token: null, isLoggedIn: false, isAdmin: false });
        onAutoLogoutRef.current?.();
      });
    },
    [readToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setAuth({ token: null, isLoggedIn: false, isAdmin: false });
    onAutoLogoutRef.current?.();
  }, []);

  return useMemo(
    () => ({
      ...auth,
      login,
      logout,
      refresh: readToken,
    }),
    [auth, login, logout, readToken]
  );
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
