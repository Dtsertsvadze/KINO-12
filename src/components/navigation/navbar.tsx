type NavbarProps = {
  variant?: "guest" | "authenticated";
  userName?: string;
  userInitials?: string;
  isProfileMenuOpen?: boolean;
};

export function Navbar({
  variant = "guest",
  userName = "Meri",
  userInitials = "MS",
  isProfileMenuOpen = false,
}: NavbarProps) {
  const isAuthenticated = variant === "authenticated";

  return (
    <header className="absolute inset-x-0 top-0 z-10 h-[108px] bg-transparent text-white">
      <nav
        className="flex h-full w-full items-center px-16"
        aria-label="Primary navigation"
      >
        <div className="flex items-center gap-[45px]">
          <span
            className="text-xl leading-none font-extrabold tracking-[0.02em] whitespace-nowrap"
            aria-label="Kino Twelve"
          >
            KINO <span className="ml-0.5 text-brand">XII</span>
          </span>
          <span className="text-[10px] leading-none font-semibold tracking-[0.14em] uppercase">
            Sessions
          </span>
        </div>

        <div className="ml-auto flex items-center gap-8">
          <div
            className="flex h-11 w-[420px] items-center gap-2 rounded-full border border-white/[0.04] bg-white/[0.14] px-[18px] text-xs leading-none font-normal text-white/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[10px]"
            aria-label="Search films and live events"
          >
            <svg
              aria-hidden="true"
              className="size-3.5 shrink-0 stroke-[1.7]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" />
              <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" />
            </svg>
            <span>Search films and live events</span>
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <div className="flex items-center gap-3.5">
                <span
                  className="relative inline-flex size-11 items-center justify-center rounded-lg bg-white/[0.13] text-xs leading-none font-bold text-white"
                  aria-hidden="true"
                >
                  {userInitials}
                  <span className="bg-status absolute right-px bottom-px size-[7px] rounded-full border-2 border-[#17212a]" />
                </span>
                <span className="min-w-12 text-[13px] leading-none font-medium">
                  {userName}
                </span>
                <svg
                  aria-hidden="true"
                  className="size-4 stroke-[1.5] text-white/[0.72]"
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
              </div>

              {isProfileMenuOpen ? (
                <div className="bg-panel/[0.96] absolute top-14 right-0 grid w-[164px] overflow-hidden rounded-[10px] border border-white/[0.08] shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
                  <span className="px-4 py-[13px] text-[13px] leading-none text-white">
                    My Profile
                  </span>
                  <span className="border-t border-white/[0.08] px-4 py-[13px] text-[13px] leading-none text-white">
                    Logout
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="bg-brand inline-flex h-11 w-[106px] items-center justify-center rounded-full text-xs leading-none font-bold whitespace-nowrap text-white">
                Sign up
              </span>
              <span className="inline-flex h-11 w-[94px] items-center justify-center rounded-full bg-white text-xs leading-none font-bold whitespace-nowrap text-[#111111]">
                Log in
              </span>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
