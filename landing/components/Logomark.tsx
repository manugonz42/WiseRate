export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path
        d="M8.5 13.5 13 9l1.4 1.4-3.1 3.1H21v2H11.3l3.1 3.1L13 20l-4.5-4.5a1.4 1.4 0 0 1 0-2Z"
        fill="var(--accent-on)"
      />
      <path
        d="M23.5 18.5 19 23l-1.4-1.4 3.1-3.1H11v-2h9.7l-3.1-3.1L19 12l4.5 4.5a1.4 1.4 0 0 1 0 2Z"
        fill="var(--accent-on)"
        opacity="0.55"
      />
    </svg>
  );
}
