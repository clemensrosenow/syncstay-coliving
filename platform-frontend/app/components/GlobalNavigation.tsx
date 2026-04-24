"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogInIcon, MenuIcon, UserRoundPlusIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { UserProfileMenu } from "@/app/components/UserProfileMenu";

const marketingLinks = [
  { href: "/#about-us", label: "About Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
];

type GlobalNavigationProps = {
  isSignedIn: boolean;
  userId?: string | null;
  userImage?: string | null;
  userName?: string | null;
};

export function GlobalNavigation({
  isSignedIn,
  userId,
  userImage,
  userName,
}: GlobalNavigationProps) {
  const pathname = usePathname();
  const showMarketingLinks = pathname === "/";
  const showAuthCtas =
    pathname !== "/auth/sign-in" && pathname !== "/auth/sign-up";
  const showMobileGuestMenu = !isSignedIn && (showMarketingLinks || showAuthCtas);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background">
      <nav className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 font-semibold">
          SyncStay
        </Link>

        {isSignedIn && userId ? (
          <UserProfileMenu
            userId={userId}
            userImage={userImage}
            userName={userName}
          />
        ) : (
          <>
            {showMarketingLinks ? (
              <NavigationMenu
                viewport={false}
                className="hidden basis-full justify-center md:flex md:basis-auto"
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
            ) : null}

            {showAuthCtas ? (
              <NavigationMenu viewport={false} className="hidden md:flex">
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
            ) : null}

            {showMobileGuestMenu ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation menu"
                  >
                    <MenuIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 md:hidden" align="end">
                  {showMarketingLinks ? (
                    <>
                      <DropdownMenuLabel>Explore</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        {marketingLinks.map((link) => (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link href={link.href}>{link.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuGroup>
                    </>
                  ) : null}

                  {showMarketingLinks && showAuthCtas ? (
                    <DropdownMenuSeparator />
                  ) : null}

                  {showAuthCtas ? (
                    <>
                      <DropdownMenuLabel>Get Started</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/sign-in">
                            <LogInIcon />
                            Sign In
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/auth/sign-up">
                            <UserRoundPlusIcon />
                            Sign Up
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </>
        )}
      </nav>
    </header>
  );
}
