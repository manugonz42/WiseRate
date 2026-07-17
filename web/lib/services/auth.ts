// Auth service — docs/services/auth.md. The only place components touch
// Supabase: they call these functions, never `createClient` directly.
//
// signUp is two calls under the hood: supabase-js `auth.signUp()` creates
// the auth.users row client-side (email confirmation is ON, so there is no
// session yet), then POST /api/auth/complete-signup inserts the `profiles`
// row server-side via the service-role client (RLS forbids client inserts;
// the referral code is also generated server-side there).

import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { HeardFrom, Profile } from "@/lib/models/types";

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 date
  countryCode: string;
  emailNotifications: boolean;
  termsVersion: string;
  providersUsed?: string[];
  heardFrom?: HeardFrom;
}

export interface AuthResult {
  error: string | null;
}

function profileFromRow(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    birthDate: row.birth_date as string,
    countryCode: row.country_code as string,
    emailNotifications: row.email_notifications as boolean,
    termsAcceptedAt: row.terms_accepted_at as string,
    termsVersion: row.terms_version as string,
    referralCode: row.referral_code as string,
    referredBy: (row.referred_by as string | null) ?? null,
    providersUsed: (row.providers_used as string[] | null) ?? null,
    heardFrom: (row.heard_from as HeardFrom | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear la cuenta." };
  }

  const response = await fetch("/api/auth/complete-signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: data.user.id,
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate,
      countryCode: input.countryCode,
      emailNotifications: input.emailNotifications,
      termsVersion: input.termsVersion,
      providersUsed: input.providersUsed,
      heardFrom: input.heardFrom,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}) as { error?: string });
    return { error: body.error ?? "No se pudo completar el registro." };
  }

  return { error: null };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return profileFromRow(data);
}

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    "firstName" | "lastName" | "countryCode" | "emailNotifications" | "providersUsed" | "heardFrom"
  >
>;

export async function updateProfile(patch: ProfileUpdate): Promise<AuthResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No has iniciado sesión." };

  const row: Record<string, unknown> = {};
  if (patch.firstName !== undefined) row.first_name = patch.firstName;
  if (patch.lastName !== undefined) row.last_name = patch.lastName;
  if (patch.countryCode !== undefined) row.country_code = patch.countryCode;
  if (patch.emailNotifications !== undefined) row.email_notifications = patch.emailNotifications;
  if (patch.providersUsed !== undefined) row.providers_used = patch.providersUsed;
  if (patch.heardFrom !== undefined) row.heard_from = patch.heardFrom;

  const { error } = await supabase.from("profiles").update(row).eq("id", user.id);
  return { error: error?.message ?? null };
}
