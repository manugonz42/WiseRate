import { redirect } from "next/navigation";

// `?ref=` must survive this redirect — the referral share link is the bare
// root domain (docs/modules/referral.md), and capture happens downstream in
// the (tabs) layout, not here.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const { ref } = await searchParams;
  const code = Array.isArray(ref) ? ref[0] : ref;
  redirect(code ? `/home?ref=${encodeURIComponent(code)}` : "/home");
}
