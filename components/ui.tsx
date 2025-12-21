import Link from "next/link";
import clsx from "clsx";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow", className)}>{children}</div>;
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const { className, variant = "primary", ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        variant === "primary"
          ? "bg-white text-black hover:opacity-90"
          : "border border-neutral-800 bg-transparent text-white hover:bg-neutral-900",
        className
      )}
    />
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-white hover:underline">{children}</Link>;
}

export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-200">{children}</span>;
}
