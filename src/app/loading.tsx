function CardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`shrink-0 rounded-2xl bg-surface ${
        compact ? "h-44 w-[500px]" : "h-[494px] w-[260px]"
      }`}
    />
  );
}

export default function Loading() {
  return (
    <main
      className="min-h-[1080px] animate-pulse bg-page text-foreground motion-reduce:animate-none"
      aria-label="Loading page"
      aria-busy="true"
    >
      <div className="h-[760px] bg-foreground/[0.04]" />

      <section className="border-b border-foreground/[0.08] px-16 py-10">
        <div className="mx-auto max-w-[1640px]">
          <div className="mb-6 h-7 w-40 rounded bg-foreground/[0.08]" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 6 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-16 py-10">
        <div className="mx-auto max-w-[1640px]">
          <div className="mb-6 h-7 w-44 rounded bg-foreground/[0.08]" />
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <CardSkeleton key={index} compact />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
