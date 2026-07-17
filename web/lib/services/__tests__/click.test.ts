import { describe, expect, it } from "vitest";
import { appendClickRef, resolveClickTarget } from "../click";

describe("resolveClickTarget", () => {
  it("resolves a known provider's website URL when it has no affiliate deal yet", () => {
    const target = resolveClickTarget("wise");
    expect(target).toEqual({ url: "https://wise.com", subIdParam: "clickref" });
  });

  it("resolves a broker by id", () => {
    const target = resolveClickTarget("torfx");
    expect(target).toEqual({ url: "https://www.torfx.com/", subIdParam: undefined });
  });

  it("returns null for an unknown id", () => {
    expect(resolveClickTarget("not-a-real-provider")).toBeNull();
  });
});

describe("appendClickRef", () => {
  it("appends the sub-id param when one is known", () => {
    const result = appendClickRef("https://wise.com/refer", "clickref", "click-123");
    expect(result).toBe("https://wise.com/refer?clickref=click-123");
  });

  it("preserves existing query params", () => {
    const result = appendClickRef("https://wise.com/refer?utm=abc", "clickref", "click-123");
    expect(new URL(result).searchParams.get("utm")).toBe("abc");
    expect(new URL(result).searchParams.get("clickref")).toBe("click-123");
  });

  it("returns the plain URL when no sub-id param is known", () => {
    const result = appendClickRef("https://www.torfx.com/", undefined, "click-123");
    expect(result).toBe("https://www.torfx.com/");
  });
});
