"use client";

import Image from "next/image";
import Link from "next/link";
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

function getFullDisplayName(user: AuthUser) {
  return user.fullName?.trim() || user.username;
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 16.5v-1.25A5.5 5.5 0 0 1 10 9.75a5.5 5.5 0 0 1 5.5 5.5v1.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
      <path
        d="m3.2 8.1 6-6 2.35 2.35a2 2 0 0 0 2.83 2.83l2.35 2.35-6 6-2.35-2.35a2 2 0 1 0-2.83-2.83L3.2 8.1Z"
        fill="currentColor"
      />
      <path d="m9 5 4.8 4.8" stroke="#070c1c" strokeDasharray="1.5 1.5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 20 20" fill="none">
      <path
        d="M8 4.25H5.75A1.75 1.75 0 0 0 4 6v8a1.75 1.75 0 0 0 1.75 1.75H8M11.5 6.5 15 10l-3.5 3.5M7 10h8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function AuthControls() {
  const {
    user,
    isLoading,
    authError,
    openLogin,
    openRegister,
    retryAuthentication,
    signOut,
  } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const profileAreaRef = useRef<HTMLDivElement>(null);
  const signOutInFlightRef = useRef(false);

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

  if (isLoading) {
    return (
      <div
        className="h-11 w-[216px] animate-pulse rounded-full bg-white/[0.1] motion-reduce:animate-none"
        aria-label="Checking your session"
        aria-busy="true"
      />
    );
  }

  if (authError) {
    return (
      <button
        type="button"
        className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-brand/[0.5] px-5 text-xs font-bold text-white transition-colors hover:bg-brand/[0.1] disabled:cursor-wait disabled:opacity-60"
        title={authError}
        onClick={retryAuthentication}
      >
        Account unavailable · Retry
      </button>
    );
  }

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
          onClick={() => openLogin()}
        >
          Log in
        </button>
      </div>
    );
  }

  async function handleSignOut() {
    if (signOutInFlightRef.current) {
      return;
    }

    signOutInFlightRef.current = true;
    setIsSigningOut(true);

    try {
      await signOut();
      setIsMenuOpen(false);
    } finally {
      signOutInFlightRef.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <div ref={profileAreaRef} className="relative">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-3.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        aria-expanded={isMenuOpen}
        aria-controls="profile-menu"
        aria-haspopup="menu"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span className="relative block size-10 shrink-0">
          <span className="relative inline-flex size-10 items-center justify-center overflow-hidden rounded-lg bg-input text-xs leading-none font-bold text-white">
            {user.avatar ? (
              <Image
                className="size-full object-cover"
                src={user.avatar}
                alt=""
                fill
                sizes="40px"
                unoptimized
              />
            ) : (
              getUserInitials(user)
            )}
          </span>
          {!user.profileComplete ? (
            <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-page bg-status" />
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
          className="absolute top-[53px] right-0 w-[340px] overflow-hidden rounded-[20px] border border-white/[0.1] bg-page shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
          role="menu"
        >
          <div className="px-6 pt-6 pb-3" role="none">
            <div className="flex items-center gap-3" role="none">
              <span className="relative block size-12 shrink-0">
                <span className="relative inline-flex size-12 items-center justify-center overflow-hidden rounded-[10px] bg-input text-sm leading-none font-bold text-white">
                  {user.avatar ? (
                    <Image
                      className="size-full object-cover"
                      src={user.avatar}
                      alt=""
                      fill
                      sizes="48px"
                      unoptimized
                    />
                  ) : (
                    getUserInitials(user)
                  )}
                </span>
                <span
                  className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-page ${
                    user.profileComplete ? "bg-success" : "bg-status"
                  }`}
                />
              </span>

              <span className="min-w-0" role="none">
                <span className="block truncate text-base leading-5 font-semibold text-white">
                  {getFullDisplayName(user)}
                </span>
                <span className="mt-0.5 block truncate text-sm leading-5 text-white/[0.62]">
                  {user.email}
                </span>
              </span>
            </div>

            {user.profileComplete ? (
              <div
                className="mt-4 flex h-11 items-center gap-2 rounded-xl bg-success/[0.1] px-3.5 text-base font-semibold text-success"
                role="none"
              >
                <span>Profile Complete</span>
                <svg
                  aria-hidden="true"
                  className="size-5"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="m4.5 10.2 3.3 3.2 7.7-7.3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-status/[0.09] px-3.5 py-3" role="none">
                <p className="text-base leading-5 font-semibold text-status">
                  Profile incomplete
                </p>
                <p className="mt-0.5 text-sm leading-5 text-white/[0.62]">
                  Please complete your profile to enable booking
                </p>
              </div>
            )}

            <div className="mt-3 grid" role="none">
              <Link
                href="/profile"
                className="flex h-12 cursor-pointer items-center gap-3 text-left text-base font-semibold text-white transition-colors duration-200 hover:text-brand"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <ProfileIcon />
                <span>My Profile</span>
              </Link>
              <Link
                href="/profile/tickets"
                className="flex h-12 cursor-pointer items-center gap-3 text-left text-base font-semibold text-white transition-colors duration-200 hover:text-brand"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                <TicketIcon />
                <span>My Tickets</span>
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="flex h-[60px] w-full cursor-pointer items-center gap-3 border-t border-white/[0.1] px-6 text-left text-base font-semibold text-brand transition-colors duration-200 hover:bg-brand/[0.06] disabled:cursor-wait disabled:opacity-50"
            role="menuitem"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogoutIcon />
            <span>{isSigningOut ? "Logging out…" : "Log out"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
