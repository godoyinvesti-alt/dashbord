import { requireContext } from "@/lib/context";
import { listContingencyAssets } from "@/lib/data/contingency-assets";
import { AssetsExplorer } from "@/components/contingency/assets-explorer";

export const metadata = { title: "Contingência" };

export default async function ContingenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  await requireContext();
  const { assets, total, page, totalPages } = await listContingencyAssets({
    q: params.q,
    tipo: params.tipo,
    status: params.status,
    page: params.page ? Number(params.page) : 1,
  });

  return <AssetsExplorer assets={assets} total={total} page={page} totalPages={totalPages} />;
}
