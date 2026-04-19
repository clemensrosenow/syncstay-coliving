import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const marketingLinks = [
  { href: "/#about-us", label: "About Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
];

function getInitials(name?: string | null) {
  if (!name) {
    return "SS";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function GlobalNavigation() {
  const session = await auth.api.getSession({
    headers: new Headers(await headers()),
  });
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background">
      <nav className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 font-semibold">
          SyncStay
        </Link>

        {isSignedIn ? (
          <Link href="/account" aria-label="Open account">
            <Avatar>
              <AvatarImage
                src={session?.user.image ?? undefined}
                alt={session?.user.name ?? "User profile"}
              />
              <AvatarFallback>
                {getInitials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <>
            <NavigationMenu
              viewport={false}
              className="order-last basis-full justify-center md:order-none md:basis-auto"
            >
              <NavigationMenuList>
                {marketingLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild>
                      <Link href={link.href} className={navigationMenuTriggerStyle()}>
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            <NavigationMenu viewport={false}>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/auth/sign-in"
                      className={buttonVariants({ variant: "ghost" })}
                    >
                      Sign In
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/auth/sign-up" className={buttonVariants()}>
                      Sign Up
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </>
        )}
      </nav>
    </header>
  );
}
