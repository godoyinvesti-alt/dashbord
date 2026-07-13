import { listSales, getSalesSummary, listChipsForSelect } from "@/lib/data/sales";
import { SalesExplorer } from "@/components/sales/sales-explorer";

export const metadata = { title: "Vendas" };

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; periodo?: string; de?: string; ate?: string; page?: string }>;
}) {
  const params = await searchParams;

  const [{ sales, total, page, totalPages }, summary, chips] = await Promise.all([
    listSales({
      q: params.q,
      periodo: params.periodo,
      de: params.de,
      ate: params.ate,
      page: params.page ? Number(params.page) : 1,
    }),
    getSalesSummary(params.periodo, params.de, params.ate),
    listChipsForSelect(),
  ]);

  return (
    <SalesExplorer
      sales={sales}
      total={total}
      page={page}
      totalPages={totalPages}
      summary={summary}
      chips={chips}
    />
  );
}
