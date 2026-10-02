"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getCurrentUser, logout } from "./api";
import { LoginDialog } from "./components/login-dialog";
import { RegisterDialog } from "./components/register-dialog";
import type { AuthUser } from "./types";

type AuthModal = "login" | "register" | null;

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  openLogin: () => void;
  openRegister: () => void;
  updateUser: (user: AuthUser) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<AuthModal>(null);

  useEffect(() => {
    let isCurrent = true;

    getCurrentUser()
      .then((currentUser) => {
        if (isCurrent) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setUser(null);
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

  const openLogin = useCallback(() => setActiveModal("login"), []);
  const openRegister = useCallback(() => setActiveModal("register"), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const handleAuthenticated = useCallback((authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
    setIsLoading(false);
    setActiveModal(null);
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
    () => ({ user, isLoading, openLogin, openRegister, updateUser, signOut }),
    [isLoading, openLogin, openRegister, signOut, updateUser, user],
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
