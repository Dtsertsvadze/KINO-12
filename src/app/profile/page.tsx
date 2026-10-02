import { PersonalInformationForm } from "@/features/profile/components/personal-information-form";
import { ProfilePageShell } from "@/features/profile/components/profile-page-shell";

export default function ProfilePage() {
  return (
    <ProfilePageShell activeTab="personal">
      <PersonalInformationForm />
    </ProfilePageShell>
  );
}
