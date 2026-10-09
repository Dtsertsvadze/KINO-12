import { ContentContainer } from "@/components/layout/content-container";

function DetailLine({ width }: { width: string }) {
  return <div className={`h-3 rounded bg-foreground/[0.07] ${width}`} />;
}

export default function SessionLoading() {
  return (
    <main
      className="animate-pulse bg-page text-foreground motion-reduce:animate-none"
      aria-label="Loading session"
      aria-busy="true"
    >
      <section className="h-[630px] bg-foreground/[0.035]">
        <ContentContainer className="flex h-full items-end gap-10 pb-12">
          <div className="h-[416px] w-[320px] shrink-0 rounded-2xl bg-foreground/[0.08]" />
          <div className="w-[720px] pb-4">
            <div className="h-6 w-24 rounded-full bg-foreground/[0.08]" />
            <div className="mt-6 h-10 w-[520px] rounded bg-foreground/[0.09]" />
            <div className="mt-6 h-3 w-full rounded bg-foreground/[0.07]" />
            <div className="mt-3 h-3 w-[82%] rounded bg-foreground/[0.07]" />
            <div className="mt-6 flex gap-2">
              <div className="h-7 w-12 rounded-full bg-foreground/[0.08]" />
              <div className="h-7 w-20 rounded-full bg-foreground/[0.08]" />
              <div className="h-7 w-16 rounded-full bg-foreground/[0.08]" />
            </div>
          </div>
        </ContentContainer>
      </section>

      <section className="min-h-[690px] py-10">
        <ContentContainer className="grid grid-cols-[1280px_400px] items-start gap-[120px]">
          <div>
            <div className="h-6 w-28 rounded bg-foreground/[0.09]" />
            <div className="mt-6 flex gap-3">
              {Array.from({ length: 7 }, (_, index) => (
                <div
                  key={index}
                  className="h-[88px] w-[88px] rounded-xl bg-surface"
                />
              ))}
            </div>
            {Array.from({ length: 2 }, (_, venueIndex) => (
              <div key={venueIndex} className="mt-8">
                <div className="h-4 w-36 rounded bg-foreground/[0.08]" />
                <div className="mt-3 flex gap-3">
                  {Array.from({ length: 4 }, (_, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="h-[116px] w-[324px] rounded-xl bg-surface"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="h-6 w-24 rounded bg-foreground/[0.09]" />
            <div className="mt-7 grid gap-6">
              <DetailLine width="w-44" />
              <DetailLine width="w-full" />
              <DetailLine width="w-28" />
              <DetailLine width="w-40" />
              <DetailLine width="w-48" />
              <DetailLine width="w-32" />
            </div>
          </div>
        </ContentContainer>
      </section>
    </main>
  );
}
