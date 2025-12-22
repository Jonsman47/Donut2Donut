import Link from "next/link";
import clsx from "clsx";

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="container section-tight">{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("card", className)}>{children}</div>;
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }
) {
  const { className, variant = "primary", ...rest } = props;
  const variantClass =
    variant === "primary"
      ? "btn btn-primary"
      : variant === "secondary"
        ? "btn btn-secondary"
        : "btn btn-ghost";

  return <button {...rest} className={clsx(variantClass, className)} />;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="nav-link">
      {children}
    </Link>
  );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "primary" | "accent" }) {
  const variantClass =
    variant === "primary" ? "badge badge-primary" : variant === "accent" ? "badge badge-accent" : "badge";

  return <span className={variantClass}>{children}</span>;
}
