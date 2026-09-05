import { verifyToken } from "@clerk/nextjs/server";

export async function requireVerifiedClerkToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  const customHeaderToken = req.headers.get("x-clerk-token");
  const rawToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader?.trim() || customHeaderToken?.trim();

  if (!rawToken) {
    return null;
  }

  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is not configured.");
  }

  try {
    const payload = await verifyToken(rawToken, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    if (!payload?.sub) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Clerk token verification failed:", error);
    return null;
  }
}
