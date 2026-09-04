"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import ChatWindow from "@/components/ChatWindow";
import { supabase } from "@/lib/auth";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    async function ensureSignedIn() {
      if (!supabase) {
        router.replace("/login?next=/chat");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login?next=/chat");
      }
    }

    ensureSignedIn();
  }, [router]);

  return <ChatWindow />;
}
