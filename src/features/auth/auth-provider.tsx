"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser, logout } from "./api";
import { LoginDialog } from "./components/login-dialog";
import { RegisterDialog } from "./components/register-dialog";
import type { AuthUser } from "./types";

type AuthModal = "login" | "register" | null;
type PendingAuthAction = () => void | Promise<void>;

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  authError?: string;
  openLogin: (afterLogin?: PendingAuthAction) => void;
  openRegister: () => void;
  retryAuthentication: () => void;
  updateUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>();
  const [activeModal, setActiveModal] = useState<AuthModal>(null);
  const pendingActionRef = useRef<PendingAuthAction | null>(null);

  useEffect(() => {
    let isCurrent = true;

    void getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setUser(null);
          setAuthError("We could not check your session. Please try again.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const retryAuthentication = useCallback(() => {
    setIsLoading(true);
    setAuthError(undefined);

    void getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
      })
      .catch(() => {
        setUser(null);
        setAuthError("We could not check your session. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const openLogin = useCallback((afterLogin?: PendingAuthAction) => {
    if (afterLogin) {
      pendingActionRef.current = afterLogin;
    }

    setActiveModal("login");
  }, []);
  const openRegister = useCallback(() => setActiveModal("register"), []);
  const closeModal = useCallback(() => {
    pendingActionRef.current = null;
    setActiveModal(null);
  }, []);

  const handleAuthenticated = useCallback((authenticatedUser: AuthUser) => {
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    setUser(authenticatedUser);
    setIsLoading(false);
    setAuthError(undefined);
    setActiveModal(null);

    if (pendingAction) {
      queueMicrotask(() => void pendingAction());
    }
  }, []);

  const updateUser = useCallback((updatedUser: AuthUser) => {
    setUser(updatedUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setActiveModal(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      authError,
      openLogin,
      openRegister,
      retryAuthentication,
      updateUser,
      signOut,
    }),
    [
      authError,
      isLoading,
      openLogin,
      openRegister,
      retryAuthentication,
      signOut,
      updateUser,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}

      <LoginDialog
        open={activeModal === "login"}
        onClose={closeModal}
        onShowRegister={openRegister}
        onAuthenticated={handleAuthenticated}
      />

      <RegisterDialog
        open={activeModal === "register"}
        onClose={closeModal}
        onShowLogin={openLogin}
        onAuthenticated={handleAuthenticated}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
