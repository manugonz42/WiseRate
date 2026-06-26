import { ModulePlaceholder } from "@/components/ModulePlaceholder";

// Missing in the index.html prototype — added here per docs/architecture/navigation.md.
// Wires to the onboarding gate once persistence (hasCompletedOnboarding) lands on web.
export default function OnboardingPage() {
  return (
    <ModulePlaceholder
      title="Onboarding"
      spec="docs/modules/onboarding.md"
      criteria={[
        "Exactly 4 pages with dot indicator: Welcome → Features → Currency → Notifications",
        "Page 3: from/to pickers default EUR / PHP",
        "Page 4: notifications explainer + Allow / Skip; analytics consent here",
        "Completing persists currencies + flag atomically (re-entry skips onboarding)",
        "No analytics fired before consent",
      ]}
    />
  );
}
