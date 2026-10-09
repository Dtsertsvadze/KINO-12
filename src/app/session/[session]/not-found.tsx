import Link from "next/link";

import { ContentContainer } from "@/components/layout/content-container";

export default function SessionNotFound() {
  return (
    <main className="min-h-[969px] bg-page pt-[132px] pb-24 text-foreground">
      <ContentContainer>
        <section className="flex min-h-[620px] flex-col items-center justify-center rounded-[28px] border border-foreground/[0.08] bg-surface px-8 text-center">
          <p className="text-sm font-extrabold tracking-[0.08em] text-brand uppercase">
            Session unavailable
          </p>
          <h1 className="mt-4 text-4xl font-extrabold">
            This session could not be found
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-foreground/[0.55]">
            It may have ended or been removed from the current cinema schedule.
          </p>
          <Link
            href="/sessions"
            className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-extrabold transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Back to sessions
          </Link>
        </section>
      </ContentContainer>
    </main>
  );
}
