import { ContentContainer } from "@/components/layout/content-container";

function SessionCardSkeleton() {
  return <div className="h-[116px] w-[270px] shrink-0 rounded-xl bg-input" />;
}

function MovieRowSkeleton() {
  return (
    <div className="border-b border-white/[0.08] py-9 first:pt-6">
      <div className="flex items-center gap-4">
        <div className="h-[84px] w-16 rounded-lg bg-white/[0.07]" />
        <div>
          <div className="h-4 w-48 rounded bg-white/[0.08]" />
          <div className="mt-3 h-3 w-20 rounded bg-white/[0.06]" />
        </div>
      </div>
      <div className="mt-5 flex gap-3 overflow-hidden">
        {Array.from({ length: 5 }, (_, index) => (
          <SessionCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export default function SessionsLoading() {
  return (
    <main
      className="min-h-[969px] animate-pulse bg-page pt-[132px] pb-24 text-white motion-reduce:animate-none"
      aria-label="Loading sessions"
      aria-busy="true"
    >
      <ContentContainer>
        <div className="h-7 w-32 rounded bg-white/[0.09]" />
        <div className="mt-2 h-3 w-52 rounded bg-white/[0.06]" />

        <div className="mt-9 grid grid-cols-[350px_1394px] items-start gap-14">
          <div className="h-[900px] rounded-[20px] bg-input" />
          <div className="min-w-0">
            <div className="flex justify-between">
              <div className="h-3 w-28 rounded bg-white/[0.07]" />
              <div className="h-3 w-52 rounded bg-white/[0.07]" />
            </div>
            {Array.from({ length: 4 }, (_, index) => (
              <MovieRowSkeleton key={index} />
            ))}
          </div>
        </div>
      </ContentContainer>
    </main>
  );
}
