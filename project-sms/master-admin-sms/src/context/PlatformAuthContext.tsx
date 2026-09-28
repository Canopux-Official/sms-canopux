import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import {
  platformLogin as apiPlatformLogin,
  PLATFORM_TOKEN_KEY,
  PLATFORM_USER_KEY,
  type PlatformUser,
} from '../api/platformApiFunctions';

interface PlatformAuthContextValue {
  token: string | null;
  user: PlatformUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const PlatformAuthContext = createContext<PlatformAuthContextValue | undefined>(undefined);

function readStoredUser(): PlatformUser | null {
  try {
    const raw = window.localStorage.getItem(PLATFORM_USER_KEY);
    return raw ? (JSON.parse(raw) as PlatformUser) : null;
  } catch {
    // Corrupt/old localStorage value — treat as logged out rather than crash the app.
    return null;
  }
}

export function PlatformAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem(PLATFORM_TOKEN_KEY)
  );
  const [user, setUser] = useState<PlatformUser | null>(() => readStoredUser());

  // NOTE: the shared API contract has no "/platform/auth/verify" endpoint, so unlike the
  // institute app (which re-verifies its token against the server on every navigation),
  // this app trusts a stored token optimistically. If the token is expired/invalid, the
  // first protected API call will come back 401 — every page that calls a protected
  // endpoint checks for that and calls logout() + redirects to /login when it happens.
  const login = useCallback(async (email: string, password: string) => {
    const result = await apiPlatformLogin(email, password);
    if (result.success && result.data?.token) {
      window.localStorage.setItem(PLATFORM_TOKEN_KEY, result.data.token);
      window.localStorage.setItem(PLATFORM_USER_KEY, JSON.stringify(result.data.user));
      setToken(result.data.token);
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, message: result.message || 'Invalid credentials' };
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(PLATFORM_TOKEN_KEY);
    window.localStorage.removeItem(PLATFORM_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: PlatformAuthContextValue = {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- standard React context file: exports the Provider component plus its hook
export function usePlatformAuth(): PlatformAuthContextValue {
  const ctx = useContext(PlatformAuthContext);
  if (!ctx) {
    throw new Error('usePlatformAuth must be used within a PlatformAuthProvider');
  }
  return ctx;
}