"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WORKSPACE_COOKIE } from "@/lib/workspace";

export async function switchWorkspaceAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") || "");
  if (!workspaceId) return;

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect("/dashboard");
}
