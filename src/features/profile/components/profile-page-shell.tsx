import Link from "next/link";
import type { ReactNode } from "react";

type ProfileTab = "personal" | "tickets";

type ProfilePageShellProps = {
  activeTab: ProfileTab;
  ticketCount?: number;
  children?: ReactNode;
};

const tabs: Array<{ id: ProfileTab; label: string; href: string }> = [
  { id: "personal", label: "Personal Information", href: "/profile" },
  { id: "tickets", label: "My Tickets", href: "/profile/tickets" },
];

export function ProfilePageShell({
  activeTab,
  ticketCount,
  children,
}: ProfilePageShellProps) {
  return (
    <main className="min-h-[1080px] bg-page px-[60px] pt-[119px] text-foreground">
      <h1 className="text-2xl leading-8 font-bold">My Profile</h1>

      <nav
        className="mt-5 flex h-[54px] items-end gap-10 border-b border-foreground/[0.1]"
        aria-label="Profile sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              href={tab.href}
              className={`flex h-full items-center border-b-2 text-sm font-semibold transition-colors duration-200 ${
                isActive
                  ? "border-brand text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {tab.id === "tickets" && ticketCount ? (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] leading-none font-extrabold text-foreground">
                  {ticketCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="pt-10">{children}</div>
    </main>
  );
}
