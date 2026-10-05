import { ProfilePageShell } from "@/features/profile/components/profile-page-shell";
import { TicketsEmptyState } from "@/features/profile/components/tickets-empty-state";

export default function MyTicketsPage() {
  return (
    <ProfilePageShell activeTab="tickets">
      <section className="min-h-[700px]" aria-labelledby="profile-tab-tickets">
        <TicketsEmptyState />
      </section>
    </ProfilePageShell>
  );
}
