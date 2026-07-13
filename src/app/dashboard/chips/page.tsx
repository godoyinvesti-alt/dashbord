import { requireContext } from "@/lib/context";
import { listChips } from "@/lib/data/chips";
import { ChipsExplorer } from "@/components/chips/chips-explorer";

export const metadata = { title: "Chips" };

export default async function ChipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireContext();
  const { chips, total, page, totalPages } = await listChips({
    q: params.q,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <ChipsExplorer
      chips={chips}
      total={total}
      page={page}
      totalPages={totalPages}
      diasAquecimentoPadrao={ctx.settings.dias_aquecimento_padrao}
    />
  );
}
