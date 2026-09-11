"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "example.auth0.com";
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "placeholder-client-id";

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const redirectUri =
    typeof window !== "undefined"
      ? `${window.location.origin}/Settings`
      : "http://localhost:3000/Settings";

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
}
