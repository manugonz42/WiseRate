/** Tiny classnames joiner — avoids a dependency for this scaffold. */
export const cn = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
