import { NextResponse } from "next/server";
import { makeSignature } from "better-auth/crypto";
import { auth } from "@/lib/auth";

const CYBERSECURITY_CONSULTANT_USER_ID =
  "0620c74e-1f5e-49df-84f6-658288cd7443";

export async function POST() {
  const authContext = await auth.$context;
  const user = await authContext.internalAdapter.findUserById(
    CYBERSECURITY_CONSULTANT_USER_ID,
  );

  if (!user) {
    return NextResponse.json(
      { error: "Prototype user not found." },
      { status: 404 },
    );
  }

  const session = await authContext.internalAdapter.createSession(user.id);

  if (!session) {
    return NextResponse.json(
      { error: "Prototype session could not be created." },
      { status: 500 },
    );
  }

  const signedSessionToken = `${session.token}.${await makeSignature(
    session.token,
    authContext.secret,
  )}`;
  const response = NextResponse.json({ redirectTo: "/search" });
  const sessionCookie = authContext.authCookies.sessionToken;
  const sameSite =
    typeof sessionCookie.attributes.sameSite === "string"
      ? sessionCookie.attributes.sameSite.toLowerCase()
      : sessionCookie.attributes.sameSite;

  response.cookies.set({
    name: sessionCookie.name,
    value: signedSessionToken,
    domain: sessionCookie.attributes.domain,
    httpOnly: sessionCookie.attributes.httpOnly,
    maxAge: sessionCookie.attributes.maxAge,
    path: sessionCookie.attributes.path,
    sameSite,
    secure: sessionCookie.attributes.secure,
  });

  return response;
}
