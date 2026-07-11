"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, FileText, Loader2, FileBarChart } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableSkeleton } from "@/components/dashboard/loading";
import { toCsv, downloadCsv } from "@/lib/csv";
import { fetchReportAction } from "@/lib/actions/reports";
import { REPORTS, type ReportId, type ReportResult } from "@/lib/reports-registry";
import { APP_NAME } from "@/lib/constants";

const GRUPOS = Array.from(new Set(REPORTS.map((r) => r.grupo)));

export function ReportViewer() {
  const [reportId, setReportId] = useState<ReportId>("vendas_diarias");
  const [result, setResult] = useState<ReportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await fetchReportAction(reportId);
      setResult(data);
    });
  }, [reportId]);

  const reportLabel = REPORTS.find((r) => r.id === reportId)?.label ?? "";

  function exportCsv() {
    if (!result) return;
    const rows = result.rows.map((row) => {
      const obj: Record<string, string | number> = {};
      for (const col of result.columns) obj[col.label] = row[col.key];
      return obj;
    });
    downloadCsv(`${reportId}.csv`, toCsv(rows));
  }

  async function exportPdf() {
    if (!result) return;
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${APP_NAME} — ${reportLabel}`, 14, 16);
    doc.setFontSize(9);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [result.columns.map((c) => c.label)],
      body: result.rows.map((row) => result.columns.map((c) => String(row[c.key] ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [42, 120, 214] },
    });
    doc.save(`${reportId}.pdf`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={reportId} onValueChange={(v) => setReportId(v as ReportId)}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            {GRUPOS.map((grupo) => (
              <SelectGroup key={grupo}>
                <SelectLabel>{grupo}</SelectLabel>
                {REPORTS.filter((r) => r.grupo === grupo).map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportCsv} disabled={!result || result.rows.length === 0}>
            <Download className="size-3.5" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={exportPdf} disabled={!result || result.rows.length === 0}>
            <FileText className="size-3.5" /> PDF
          </Button>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : !result || result.rows.length === 0 ? (
        <EmptyState icon={FileBarChart} title="Sem dados para este relatório" description="Ajuste os filtros ou aguarde novos registros para visualizar este relatório." />
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {result.columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rows.map((row, i) => (
                <TableRow key={i}>
                  {result.columns.map((c) => (
                    <TableCell key={c.key} className="text-sm">{row[c.key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
