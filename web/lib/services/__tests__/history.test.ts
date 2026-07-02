import { describe, expect, it } from "vitest";
import { rangeToDateWindow } from "../history";

// Fixed "today" so date math is deterministic regardless of when tests run.
const TODAY = new Date("2026-07-02T12:00:00Z");

describe("rangeToDateWindow", () => {
  it("7D goes back 7 calendar days", () => {
    expect(rangeToDateWindow("7D", TODAY)).toEqual({
      start: "2026-06-25",
      end: "2026-07-02",
    });
  });

  it("30D goes back 30 calendar days", () => {
    expect(rangeToDateWindow("30D", TODAY)).toEqual({
      start: "2026-06-02",
      end: "2026-07-02",
    });
  });

  it("3M goes back 3 calendar months", () => {
    expect(rangeToDateWindow("3M", TODAY)).toEqual({
      start: "2026-04-02",
      end: "2026-07-02",
    });
  });

  it("6M goes back 6 calendar months", () => {
    expect(rangeToDateWindow("6M", TODAY)).toEqual({
      start: "2026-01-02",
      end: "2026-07-02",
    });
  });

  it("1Y goes back 1 calendar year", () => {
    expect(rangeToDateWindow("1Y", TODAY)).toEqual({
      start: "2025-07-02",
      end: "2026-07-02",
    });
  });

  it("end always equals today regardless of range", () => {
    const { end } = rangeToDateWindow("30D", TODAY);
    expect(end).toBe("2026-07-02");
  });
});
