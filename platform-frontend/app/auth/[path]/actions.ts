"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { makeSignature } from "better-auth/crypto";

import { auth } from "@/lib/auth";

export type PrototypeLoginState = {
  error: string | null;
};

export async function prototypeLoginAction(
  _prevState: PrototypeLoginState,
  formData: FormData,
): Promise<PrototypeLoginState> {
  const userId = formData.get("userId");

  if (typeof userId !== "string" || userId.length === 0) {
    return { error: "Select a prototype user first." };
  }

  const authContext = await auth.$context;
  const user = await authContext.internalAdapter.findUserById(userId);

  if (!user) {
    return { error: "Prototype user not found." };
  }

  const session = await authContext.internalAdapter.createSession(user.id);

  if (!session) {
    return { error: "Prototype session could not be created." };
  }

  const signedSessionToken = `${session.token}.${await makeSignature(
    session.token,
    authContext.secret,
  )}`;
  const sessionCookie = authContext.authCookies.sessionToken;
  const sameSite =
    typeof sessionCookie.attributes.sameSite === "string"
      ? sessionCookie.attributes.sameSite.toLowerCase()
      : sessionCookie.attributes.sameSite;

  const cookieStore = await cookies();

  cookieStore.set({
    name: sessionCookie.name,
    value: signedSessionToken,
    domain: sessionCookie.attributes.domain,
    httpOnly: sessionCookie.attributes.httpOnly,
    maxAge: sessionCookie.attributes.maxAge,
    path: sessionCookie.attributes.path,
    sameSite,
    secure: sessionCookie.attributes.secure,
  });

  redirect("/search");
}
