"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">Something went wrong.</h1>
      <p className="text-sm text-text-secondary">
        Try again, or head back to{" "}
        <Link href="/home" className="text-primary underline">
          Home
        </Link>{" "}
        or{" "}
        <Link href="/compare" className="text-primary underline">
          Compare
        </Link>
        .
      </p>
      <button
        onClick={() => reset()}
        className="mt-1 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-light transition active:scale-[0.97]"
      >
        Try again
      </button>
    </main>
  );
}
