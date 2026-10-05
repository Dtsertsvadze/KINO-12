import Link from "next/link";

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className = "" }: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`cursor-pointer leading-none font-extrabold tracking-[0.02em] whitespace-nowrap focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${className}`}
      aria-label="Kino Twelve home"
    >
      KINO <span className="ml-0.5 text-brand">XII</span>
    </Link>
  );
}
