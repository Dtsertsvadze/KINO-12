import { BrandLogo } from "@/components/navigation/brand-logo";

export function Footer() {
  return (
    <footer className="h-[111px] bg-page px-[60px] pt-10 pb-10 text-white">
      <div className="flex h-full items-end justify-between border-t border-white/[0.12]">
        <BrandLogo className="text-[13px]" />
        <p className="text-[10px] leading-none font-normal text-white/[0.48]">
          © {new Date().getFullYear()} Kino XII. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
