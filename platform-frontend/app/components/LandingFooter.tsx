"use client";

import { usePathname } from "next/navigation";

const links = {
  Product: ["Features", "Pricing", "Roadmap", "Changelog"],
  Company: ["About us", "Team", "Blog", "Press"],
  Legal: ["Privacy Policy", "Terms & Conditions", "Legal Notice", "Cookie Policy"],
  Support: ["FAQ", "Documentation", "Community", "Contact"],
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
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                S
              </span>
              <span className="font-heading text-lg font-semibold text-white">
                SyncStay
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Remote, but never alone. AI-powered matching for digital nomads.
            </p>
            <p className="mt-4 text-xs text-slate-500">© 2025 SyncStay GmbH</p>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="mb-4 text-sm font-medium text-white">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      onClick={(event) => event.preventDefault()}
                      className="text-sm text-slate-400 transition-colors duration-200 hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            Made by WWI23SCA | DHBW Mannheim | Integrationsseminar 2025
          </p>
          <button
            type="button"
            onClick={handleScrollTop}
            className="text-xs text-primary transition-colors hover:text-sky-300"
          >
            ↑ Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
