import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center text-[#F5F5F0]">
      <span className="type-eyebrow">
        L&apos;OR NOIR
      </span>
      <h1 className="type-h1 mt-2 text-white">Page Not Found</h1>
      <p className="mt-3 max-w-md type-body-sm text-zinc-400">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand-gold px-8 py-3 type-ui text-black transition-colors hover:bg-brand-gold-hover"
      >
        Return Home
      </Link>
    </div>
  );
}
