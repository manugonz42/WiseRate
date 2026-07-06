import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-extrabold tracking-tight">Page not found.</h1>
      <p className="text-sm text-text-secondary">
        That page doesn&apos;t exist — try{" "}
        <Link href="/home" className="text-primary underline">
          Home
        </Link>{" "}
        or{" "}
        <Link href="/compare" className="text-primary underline">
          Compare
        </Link>
        .
      </p>
    </main>
  );
}
