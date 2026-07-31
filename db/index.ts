import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!client) client = postgres(databaseUrl, { prepare: false, max: 5, idle_timeout: 20 });
  return drizzle(client, { schema });
}
