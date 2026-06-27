import type { Config } from "tailwindcss";

// Token bindings live here only — components reference these via Tailwind
// classes, never raw hex. Source of truth: docs/architecture/design-system.md.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      bg: "var(--bg)",
      surface: "var(--surface)",
      "surface-elevated": "var(--surface-elevated)",
      "surface-hover": "var(--surface-hover)",
      border: "var(--border)",
      "border-subtle": "var(--border-subtle)",
      primary: {
        DEFAULT: "var(--primary)",
        light: "var(--primary-light)",
        dark: "var(--primary-dark)",
      },
      accent: "var(--accent)",
      success: "var(--success)",
      warning: "var(--warning)",
      error: "var(--error)",
      text: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
      },
    },
    borderRadius: {
      none: "0",
      xs: "var(--radius-xs)",
      sm: "var(--radius-sm)",
      DEFAULT: "var(--radius)",
      full: "9999px",
    },
    spacing: {
      "0": "0px",
      xs: "var(--space-xs)",
      sm: "var(--space-sm)",
      md: "var(--space-md)",
      lg: "var(--space-lg)",
      xl: "var(--space-xl)",
      xxl: "var(--space-xxl)",
      xxxl: "var(--space-xxxl)",
      xxxxl: "var(--space-xxxxl)",
    },
    fontSize: {
      "large-title": ["34px", { lineHeight: "1.1", fontWeight: "800" }],
      title: ["28px", { lineHeight: "1.15", fontWeight: "800" }],
      title2: ["22px", { lineHeight: "1.2", fontWeight: "700" }],
      title3: ["20px", { lineHeight: "1.25", fontWeight: "700" }],
      headline: ["17px", { lineHeight: "1.3", fontWeight: "600" }],
      body: ["17px", { lineHeight: "1.4", fontWeight: "400" }],
      callout: ["16px", { lineHeight: "1.4", fontWeight: "400" }],
      subhead: ["15px", { lineHeight: "1.4", fontWeight: "400" }],
      footnote: ["13px", { lineHeight: "1.4", fontWeight: "400" }],
      caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
      caption2: ["11px", { lineHeight: "1.4", fontWeight: "400" }],
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        DEFAULT: "var(--shadow-default)",
        elevated: "var(--shadow-elevated)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
    },
  },
  plugins: [],
};

export default config;
