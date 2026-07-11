"use server";

import { requireContext } from "@/lib/workspace";
import { getReport } from "@/lib/data/reports";
import type { ReportId } from "@/lib/reports-registry";

export async function fetchReportAction(id: ReportId) {
  const ctx = await requireContext();
  return getReport(ctx.workspace.id, id);
}
