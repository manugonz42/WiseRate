import { describe, expect, it } from "vitest";
import { CORRIDORS, getCorridor } from "../corridors";

describe("CORRIDORS registry", () => {
  it("has unique slugs", () => {
    const slugs = CORRIDORS.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("each entry has at least 4 FAQ items", () => {
    for (const c of CORRIDORS) {
      expect(c.faq.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("each entry has non-empty intro and metaDescription", () => {
    for (const c of CORRIDORS) {
      expect(c.intro.length).toBeGreaterThan(0);
      for (const p of c.intro) expect(p.trim().length).toBeGreaterThan(0);
      expect(c.metaDescription.trim().length).toBeGreaterThan(0);
    }
  });

  it("every FAQ entry has a non-empty question and answer", () => {
    for (const c of CORRIDORS) {
      for (const f of c.faq) {
        expect(f.question.trim().length).toBeGreaterThan(0);
        expect(f.answer.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("getCorridor resolves a known slug and rejects an unknown one", () => {
    expect(getCorridor("eur-to-php")?.from).toBe("EUR");
    expect(getCorridor("nope")).toBeUndefined();
  });
});
