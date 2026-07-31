import { redirect } from "next/navigation";
import { auth, isAllowedAdmin } from "../auth.ts";

export async function requireAdmin(returnTo: string) {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAllowedAdmin(email)) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  }

  return email!;
}

export async function getAdminEmail() {
  const session = await auth();
  const email = session?.user?.email;
  return isAllowedAdmin(email) ? email! : null;
}
