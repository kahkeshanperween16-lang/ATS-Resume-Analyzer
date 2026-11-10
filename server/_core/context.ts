
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createClient } from "@supabase/supabase-js";
import type { User } from "../../shared/db-types";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const supabaseAuth = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  const authorization = opts.req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (token) {
    try {
      const { data, error } = await supabaseAuth.auth.getUser(token);

      if (error) {
        console.warn("[Auth] Invalid or expired access token");
      } else if (data.user) {
        const authUser = data.user;
        const metadataName = authUser.user_metadata?.full_name;

        await db.upsertUser({
          openId: authUser.id,
          name: typeof metadataName === "string" ? metadataName : null,
          email: authUser.email ?? null,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });

        user = (await db.getUserByOpenId(authUser.id)) ?? null;
      }
    } catch (error) {
      console.error("[Auth] Authentication failed:", error);
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
