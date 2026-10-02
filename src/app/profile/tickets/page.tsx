import { ProfilePageShell } from "@/features/profile/components/profile-page-shell";

export default function MyTicketsPage() {
  return (
    <ProfilePageShell activeTab="tickets">
      <section
        className="min-h-[700px]"
        aria-labelledby="profile-tab-tickets"
      />
    </ProfilePageShell>
  );
}
