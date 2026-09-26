import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "bluntforce_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 14;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string;
  email: string;
  username: string;
};

export async function createSession(user: SessionPayload) {
  return new SignJWT({ email: user.email, username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .setIssuer("bluntforce")
    .setAudience("bluntforce-web")
    .sign(getSessionSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      issuer: "bluntforce",
      audience: "bluntforce-web",
    });
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.username !== "string") {
      return null;
    }
    return { sub: payload.sub, email: payload.email, username: payload.username };
  } catch {
    return null;
  }
}

export const sessionCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
