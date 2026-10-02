"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../auth-provider";
import type { AuthUser } from "../types";

function getUserInitials(user: AuthUser) {
  const name = user.fullName?.trim() || user.username;
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

function getDisplayName(user: AuthUser) {
  return user.fullName?.trim().split(/\s+/)[0] || user.username;
}

export function AuthControls() {
  const { user, openLogin, openRegister, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!profileAreaRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="inline-flex h-11 w-[106px] cursor-pointer items-center justify-center rounded-full bg-brand text-sm leading-none font-extrabold whitespace-nowrap text-white transition-colors duration-200 ease-out hover:bg-brand/[0.85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
          onClick={openRegister}
        >
          Sign up
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-[94px] cursor-pointer items-center justify-center rounded-full bg-white text-sm leading-none font-extrabold whitespace-nowrap text-[#111111] transition-colors duration-200 ease-out hover:bg-white/[0.88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"
          onClick={openLogin}
        >
          Log in
        </button>
      </div>
    );
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
      setIsMenuOpen(false);
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div ref={profileAreaRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-3.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        aria-expanded={isMenuOpen}
        aria-controls="profile-menu"
        aria-haspopup="menu"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span className="relative inline-flex size-11 items-center justify-center overflow-hidden rounded-lg bg-white/[0.13] text-xs leading-none font-bold text-white">
          {user.avatar ? (
            // The Laravel API returns an absolute public avatar URL.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="size-full object-cover"
              src={user.avatar}
              alt=""
            />
          ) : (
            getUserInitials(user)
          )}
          {!user.profileComplete ? (
            <span className="absolute right-px bottom-px size-[7px] rounded-full border-2 border-[#17212a] bg-status" />
          ) : null}
        </span>
        <span className="min-w-12 text-left text-[13px] leading-none font-medium">
          {getDisplayName(user)}
        </span>
        <svg
          aria-hidden="true"
          className={`size-4 stroke-[1.5] text-white/[0.72] transition-transform ${
            isMenuOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="m6 8 4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isMenuOpen ? (
        <div
          id="profile-menu"
          className="absolute top-14 right-0 grid w-[176px] overflow-hidden rounded-[10px] border border-white/[0.08] bg-panel/[0.96] shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
          role="menu"
        >
          <button
            type="button"
            className="cursor-not-allowed px-4 py-[13px] text-left text-[13px] leading-none text-white/[0.4]"
            role="menuitem"
            disabled
          >
            My Profile
          </button>
          <button
            type="button"
            className="border-t border-white/[0.08] px-4 py-[13px] text-left text-[13px] leading-none text-white transition hover:bg-white/[0.07] disabled:cursor-wait disabled:opacity-50"
            role="menuitem"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
