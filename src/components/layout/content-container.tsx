import type { ReactNode } from "react";

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export function ContentContainer({
  children,
  className = "",
}: ContentContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1800px] ${className}`}>
      {children}
    </div>
  );
}
