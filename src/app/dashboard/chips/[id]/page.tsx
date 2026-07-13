import { notFound } from "next/navigation";
import { requireContext } from "@/lib/context";
import { getChipDetail } from "@/lib/data/chips";
import { ChipDetailView } from "@/components/chips/chip-detail-view";

export const metadata = { title: "Detalhes do chip" };

export default async function ChipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireContext();
  const detail = await getChipDetail(id);

  if (!detail) notFound();

  return <ChipDetailView detail={detail} diasAquecimentoPadrao={ctx.settings.dias_aquecimento_padrao} />;
}
