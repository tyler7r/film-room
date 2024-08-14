import { createServerClient, serialize } from "@supabase/ssr";
import { type GetServerSidePropsContext } from "next";
import { type Database } from "~/utils/types";

export function createClient({ req, res }: GetServerSidePropsContext) {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || "",
          }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            "Set-Cookie",
            cookiesToSet.map(({ name, value, options }) =>
              serialize(name, value, options),
            ),
          );
        },
      },
    },
  );

  return supabase;
}
