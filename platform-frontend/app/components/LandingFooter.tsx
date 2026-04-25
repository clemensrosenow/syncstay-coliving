"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = {
  Product: [
    { label: "How it works", href: "/#how-it-works" },
    { label: "About us", href: "/#team" },
    { label: "Pricing", href: "/#pricing" },
  ],
  Actions: [
    { label: "Browse stays", href: "/search" },
    { label: "Sign in", href: "/auth/sign-in" },
    { label: "Sign up", href: "/auth/sign-up" },
  ],
  Legal: [
    { label: "Privacy Policy" },
    { label: "Terms & Conditions" },
    { label: "Legal Notice" },
  ],
};

export function LandingFooter() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  const handleScrollTop = () => {
    const heroSection = document.getElementById("hero");

    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t-2 border-border bg-linear-to-b from-muted to-background text-foreground shadow-inner">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="font-heading text-lg font-semibold text-foreground">
                SyncStay
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              Remote, but never alone. AI-powered matching for digital nomads.
            </p>
            <p className="mt-4 text-xs text-muted-foreground/80">© 2026 SyncStay GmbH</p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-medium text-foreground">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground/75">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground/80">
            Made by WWI23SCA | DHBW Mannheim | Integrationsseminar 2026
          </p>
          <button
            type="button"
            onClick={handleScrollTop}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            ↑ Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
