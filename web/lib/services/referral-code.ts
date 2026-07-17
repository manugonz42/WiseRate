// Referral code generator — docs/services/auth.md "Referral code".
// 8 chars, uppercase, Crockford-style base32 alphabet excluding the
// confusable pairs 0/O and 1/I (32 symbols: digits 2-9 + A-Z minus I, O).

// Exported so callers that validate a submitted code (capture, attribution)
// share the exact same alphabet instead of redeclaring it.
export const REFERRAL_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;
const MAX_ATTEMPTS = 5;

export function generateReferralCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += REFERRAL_CODE_ALPHABET[bytes[i] % REFERRAL_CODE_ALPHABET.length];
  }
  return code;
}

// Retries on collision. `codeExists` is injected so callers own the storage
// lookup (Supabase in prod, a stub in tests).
export async function generateUniqueReferralCode(
  codeExists: (code: string) => Promise<boolean>,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateReferralCode();
    if (!(await codeExists(code))) return code;
  }
  throw new Error("Could not generate a unique referral code after " + MAX_ATTEMPTS + " attempts");
}
