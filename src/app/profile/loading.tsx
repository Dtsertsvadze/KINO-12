export default function ProfileLoading() {
  return (
    <main
      className="min-h-[1080px] animate-pulse bg-page px-[60px] pt-[119px] text-foreground motion-reduce:animate-none"
      aria-label="Loading profile"
      aria-busy="true"
    >
      <div className="h-8 w-40 rounded bg-foreground/[0.08]" />
      <div className="mt-5 h-[54px] border-b border-foreground/[0.08]" />
      <div className="mt-10 grid w-[880px] gap-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="grid gap-2">
            <div className="h-4 w-28 rounded bg-foreground/[0.07]" />
            <div className="h-11 rounded-xl bg-surface" />
          </div>
        ))}
        <div className="mt-3 h-11 w-32 rounded-full bg-foreground/[0.08]" />
      </div>
    </main>
  );
}
