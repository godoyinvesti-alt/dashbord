import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { ReportViewer } from "@/components/reports/report-viewer";

export const metadata: Metadata = { title: "Relatórios" };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Consulte e exporte relatórios detalhados da sua operação"
      />
      <ReportViewer />
    </div>
  );
}
