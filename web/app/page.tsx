import { redirect } from "next/navigation";

// Onboarding gate (UserProfile.hasCompletedOnboarding) lands here later —
// see docs/architecture/navigation.md. For now boot straight into the tab bar.
export default function RootPage() {
  redirect("/home");
}
