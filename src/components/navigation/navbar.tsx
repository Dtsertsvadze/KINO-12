import Link from "next/link";

import { ContentContainer } from "@/components/layout/content-container";
import { BrandLogo } from "@/components/navigation/brand-logo";
import { AuthControls } from "@/features/auth/components/auth-controls";

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 h-[111px] bg-transparent text-white">
      <ContentContainer className="h-full">
        <nav
          className="flex h-full items-center justify-between pt-[30px] pb-[40px]"
          aria-label="Primary navigation"
        >
          <div className="flex items-center gap-[45px]">
            <BrandLogo className="text-xl" />
            <Link
              href="/sessions"
              className="text-[10px] leading-none font-semibold tracking-[0.14em] uppercase transition-colors hover:text-brand focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              Sessions
            </Link>
          </div>

          <div className="flex items-center gap-8">
            <div
              className="flex h-[41px] w-[380px] items-center gap-1 rounded-full border border-white/[0.04] bg-white/[0.14] px-3 py-1.5 text-xs leading-none font-normal text-white/[0.82] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[10px]"
              aria-label="Search films and live events"
            >
              <svg
                aria-hidden="true"
                className="size-3.5 shrink-0 stroke-[1.7]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" />
                <path
                  d="m16 16 4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                />
              </svg>
              <span>Search films and live events</span>
            </div>

            <AuthControls />
          </div>
        </nav>
      </ContentContainer>
    </header>
  );
}
