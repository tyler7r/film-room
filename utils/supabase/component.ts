import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "~/utils/types";

export function createClient() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  return supabase;
}

export const supabase = createClient();
