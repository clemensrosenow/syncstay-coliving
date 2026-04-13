"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type MockPrototypeLoginProps = {
  path: string;
};

export function MockPrototypeLogin({ path }: MockPrototypeLoginProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (path !== "sign-in" && path !== "sign-up") {
    return null;
  }

  async function handlePrototypeLogin() {
    setError(null);

    const response = await fetch("/api/prototype/mock-login", {
      method: "POST",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(payload?.error ?? "Prototype login failed.");
      return;
    }

    const payload = (await response.json()) as { redirectTo?: string };

    startTransition(() => {
      router.push(payload.redirectTo ?? "/search");
      router.refresh();
    });
  }

  return (
    <section className="mt-6 w-full max-w-md rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">
        Prototype Access
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Skip credentials and enter the prototype as the cybersecurity
        consultant persona.
      </p>
      <Button
        className="mt-4 w-full"
        onClick={handlePrototypeLogin}
        disabled={isPending}
        type="button"
      >
        {isPending
          ? "Signing in..."
          : "Continue as Cybersecurity Consultant"}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      ) : null}
    </section>
  );
}
