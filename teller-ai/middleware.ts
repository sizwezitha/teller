import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware();

export const config = {
  matcher: [
    "/api/:path*",
    "/chat/:path*"
  ],
};
