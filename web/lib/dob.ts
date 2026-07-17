// Date-of-birth parsing/validation shared by the DateOfBirthField (client
// mask + calendar popover) and /api/auth/complete-signup (server check) —
// docs/plan/T35-signup-ui.md: "Client+server validation: valid date, age >= 18."

const DISPLAY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const MIN_AGE = 18;

// "DD/MM/YYYY" -> "YYYY-MM-DD", or null if not a real calendar date.
export function parseDisplayDate(display: string): string | null {
  const match = DISPLAY_RE.exec(display.trim());
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return isReal ? isoDate(date) : null;
}

// "YYYY-MM-DD" -> "DD/MM/YYYY"
export function formatIsoToDisplay(iso: string): string {
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isAdult(iso: string, now: Date = new Date()): boolean {
  const [yyyy, mm, dd] = iso.split("-").map(Number);
  const birth = Date.UTC(yyyy, mm - 1, dd);
  const cutoff = Date.UTC(
    now.getUTCFullYear() - MIN_AGE,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return birth <= cutoff;
}

// Applies a "DD/MM/YYYY" typing mask to raw input: strips non-digits, inserts
// slashes, caps at 8 digits. Used on every keystroke in the text field.
export function maskDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(
    Boolean,
  );
  return parts.join("/");
}
