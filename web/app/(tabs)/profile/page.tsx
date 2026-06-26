import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function ProfilePage() {
  return (
    <ModulePlaceholder
      title="Profile"
      spec="docs/modules/profile.md"
      criteria={[
        "User header: avatar/initials, name, email, Premium badge when entitled",
        "Editable: name, send/receive currency, default delivery method",
        "Favorites (horizontal scroll) + recent providers (capped at 10)",
        "Save disabled until a field changes; Cancel reverts unsaved edits",
      ]}
    />
  );
}
