import { getSupabaseClient } from "@/lib/supabase";

export type PlanType = "free" | "pro" | "business";

export const supabase = getSupabaseClient();

export function hasSupabaseConfig() {
  return Boolean(supabase);
}

export async function getCurrentUserPlan(): Promise<PlanType> {
  const client = getSupabaseClient();

  if (!client) return "free";

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return "free";

  const { data, error: profileError } = await client
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if (profileError || !data?.plan) return "free";

  return data.plan as PlanType;
}

export async function requirePremiumAccess(): Promise<PlanType> {
  const plan = await getCurrentUserPlan();

  if (plan === "free") {
    throw new Error("Premium access required.");
  }

  return plan;
}
