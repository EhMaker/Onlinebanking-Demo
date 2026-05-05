import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/auth";

/**
 * Fetches the authenticated user's profile row from the `profiles` table.
 * Requires RLS policy: "Users can view their own profile."
 *   CREATE POLICY "own profile" ON profiles FOR SELECT USING (auth.uid() = id);
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // PGRST116 = no rows found → profile not created yet (e.g. email not confirmed)
    if (error.code === "PGRST116") return null;
    console.error("[authService] fetchProfile error:", error.message);
    return null;
  }

  return data as Profile;
}
