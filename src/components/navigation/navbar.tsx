import Link from "next/link";

import { ContentContainer } from "@/components/layout/content-container";
import { BrandLogo } from "@/components/navigation/brand-logo";
import { AuthControls } from "@/features/auth/components/auth-controls";
import { MovieSearch } from "@/features/movies/components/movie-search";

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 h-[111px] bg-transparent text-foreground">
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
            <MovieSearch />

            <AuthControls />
          </div>
        </nav>
      </ContentContainer>
    </header>
  );
}
