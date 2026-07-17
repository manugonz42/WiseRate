import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateUniqueReferralCode } from "@/lib/services/referral-code";
import { isAdult } from "@/lib/dob";
import type { HeardFrom } from "@/lib/models/types";

// POST /api/auth/complete-signup
//
// Second half of AuthService.signUp (lib/services/auth.ts): inserts the
// `profiles` row with a server-generated referral code. RLS forbids client
// inserts on `profiles` by design (docs/services/auth.md), and email
// confirmation being ON means there's no session yet to authenticate this
// request the normal cookie way — so instead we trust `userId` exactly as
// returned by the client's own `auth.signUp()` call a moment earlier (an
// unguessable UUID) and cross-check it against Supabase Admin before using
// it, rather than trusting the client-submitted `email` at face value.
interface CompleteSignupBody {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  countryCode: string;
  emailNotifications: boolean;
  termsVersion: string;
  providersUsed?: string[];
  heardFrom?: HeardFrom;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompleteSignupBody;

  if (!body.userId || !body.email || !body.firstName || !body.lastName || !body.birthDate || !body.countryCode || !body.termsVersion) {
    return NextResponse.json({ error: "Missing required field." }, { status: 400 });
  }

  if (!isAdult(body.birthDate)) {
    return NextResponse.json({ error: "Must be at least 18 years old." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: userData, error: userError } = await service.auth.admin.getUserById(body.userId);
  if (userError || !userData.user || userData.user.email !== body.email) {
    return NextResponse.json({ error: "Invalid signup." }, { status: 401 });
  }

  const referralCode = await generateUniqueReferralCode(async (code) => {
    const { data } = await service.from("profiles").select("id").eq("referral_code", code).maybeSingle();
    return !!data;
  });

  const { error } = await service.from("profiles").insert({
    id: body.userId,
    first_name: body.firstName,
    last_name: body.lastName,
    birth_date: body.birthDate,
    country_code: body.countryCode,
    email_notifications: body.emailNotifications,
    terms_accepted_at: new Date().toISOString(),
    terms_version: body.termsVersion,
    referral_code: referralCode,
    providers_used: body.providersUsed ?? null,
    heard_from: body.heardFrom ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referralCode });
}
