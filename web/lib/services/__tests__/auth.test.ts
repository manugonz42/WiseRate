import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockSupabase } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

const { signIn, signOut, getSession, getProfile, updateProfile, signUp } = await import(
  "../auth"
);

const PROFILE_ROW = {
  id: "u1",
  first_name: "Ana",
  last_name: "Cruz",
  birth_date: "1990-01-01",
  country_code: "PH",
  email_notifications: true,
  terms_accepted_at: "2026-07-17T00:00:00Z",
  terms_version: "v1",
  referral_code: "ABCD2345",
  referred_by: null,
  providers_used: null,
  heard_from: "friend",
  created_at: "2026-07-17T00:00:00Z",
};

describe("auth service (mocked Supabase client)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("signIn: happy path returns no error", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    const result = await signIn("ana@example.com", "hunter2");
    expect(result.error).toBeNull();
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "ana@example.com",
      password: "hunter2",
    });
  });

  it("signIn: surfaces the Supabase error message", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    const result = await signIn("ana@example.com", "wrong");
    expect(result.error).toBe("Invalid login credentials");
  });

  it("signOut: calls the Supabase client", async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });
    await signOut();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it("getSession: returns the current session", async () => {
    const fakeSession = { access_token: "t" };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: fakeSession } });
    expect(await getSession()).toBe(fakeSession);
  });

  it("getProfile: returns null when logged out (no profile lookup)", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    expect(await getProfile()).toBeNull();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it("getProfile: maps the profiles row to camelCase", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const maybeSingle = vi.fn().mockResolvedValue({ data: PROFILE_ROW, error: null });
    const eq = vi.fn(() => ({ maybeSingle }));
    const select = vi.fn(() => ({ eq }));
    mockSupabase.from.mockReturnValue({ select });

    const profile = await getProfile();

    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(eq).toHaveBeenCalledWith("id", "u1");
    expect(profile).toMatchObject({
      id: "u1",
      firstName: "Ana",
      lastName: "Cruz",
      referralCode: "ABCD2345",
      heardFrom: "friend",
    });
  });

  it("updateProfile: rejects when logged out", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const result = await updateProfile({ firstName: "Ana" });
    expect(result.error).toBe("No has iniciado sesión.");
  });

  it("updateProfile: writes snake_case columns for the caller's own row", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    mockSupabase.from.mockReturnValue({ update });

    const result = await updateProfile({ firstName: "Ana", emailNotifications: true });

    expect(result.error).toBeNull();
    expect(update).toHaveBeenCalledWith({ first_name: "Ana", email_notifications: true });
    expect(eq).toHaveBeenCalledWith("id", "u1");
  });

  it("signUp: happy path calls auth.signUp then completes via the API route", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ referralCode: "ABCD2345" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await signUp({
      email: "ana@example.com",
      password: "hunter2",
      firstName: "Ana",
      lastName: "Cruz",
      birthDate: "1990-01-01",
      countryCode: "PH",
      emailNotifications: false,
      termsVersion: "v1",
    });

    expect(result.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/complete-signup",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ userId: "u1", email: "ana@example.com", firstName: "Ana" });
  });

  it("signUp: stops before the API call when auth.signUp fails", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { message: "User already registered" },
    });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await signUp({
      email: "ana@example.com",
      password: "hunter2",
      firstName: "Ana",
      lastName: "Cruz",
      birthDate: "1990-01-01",
      countryCode: "PH",
      emailNotifications: false,
      termsVersion: "v1",
    });

    expect(result.error).toBe("User already registered");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("signUp: surfaces an error from the complete-signup route", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid signup." }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await signUp({
      email: "ana@example.com",
      password: "hunter2",
      firstName: "Ana",
      lastName: "Cruz",
      birthDate: "1990-01-01",
      countryCode: "PH",
      emailNotifications: false,
      termsVersion: "v1",
    });

    expect(result.error).toBe("Invalid signup.");
  });
});
