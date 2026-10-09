import { BrandLogo } from "@/components/navigation/brand-logo";
import { ContentContainer } from "./content-container";

export function Footer() {
  return (
    <footer className="h-[111px] bg-page pt-10 pb-10 text-foreground">
      <ContentContainer className="flex h-full items-end justify-between border-t border-foreground/[0.12]">
        <BrandLogo className="text-[13px]" />
        <p className="text-[10px] leading-none font-normal text-foreground/[0.48]">
          © {new Date().getFullYear()} Kino XII. All rights reserved.
        </p>
      </ContentContainer>
    </footer>
  );
}
