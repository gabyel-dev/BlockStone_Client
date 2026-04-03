/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate } from "react-router-dom";
import { getMe, sendOnlineHeartbeat } from "../api/auth";

const AuthContext = createContext(null);

const CheckingSession = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <p>Checking session...</p>
    </main>
  );
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isHeartbeatInFlightRef = useRef(false);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMe();
      const user = response?.data?.data ?? null;
      setAuthUser(user);
    } catch {
      setAuthUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const onAuthChanged = () => {
      checkAuth();
    };

    window.addEventListener("auth:changed", onAuthChanged);
    return () => {
      window.removeEventListener("auth:changed", onAuthChanged);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!authUser?.id) {
      return;
    }

    const sendHeartbeat = async () => {
      if (isHeartbeatInFlightRef.current) {
        return;
      }

      // Skip heartbeats while tab is hidden to reduce unnecessary traffic.
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        return;
      }

      try {
        isHeartbeatInFlightRef.current = true;
        await sendOnlineHeartbeat();
      } catch {
        // Keep heartbeat errors silent; auth APIs still handle session refresh separately.
      } finally {
        isHeartbeatInFlightRef.current = false;
      }
    };

    sendHeartbeat();

    const intervalId = setInterval(() => {
      sendHeartbeat();
    }, 45 * 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      isHeartbeatInFlightRef.current = false;
    };
  }, [authUser?.id]);

  const value = useMemo(
    () => ({
      authUser,
      isAuthenticated: Boolean(authUser?.id),
      loading,
      checkAuth,
      setAuthUser,
    }),
    [authUser, loading, checkAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  return context;
};

export const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <CheckingSession />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const GuestOnly = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <CheckingSession />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
