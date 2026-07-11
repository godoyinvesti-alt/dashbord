import type { Metadata } from "next";

import { requireContext } from "@/lib/workspace";
import { listProductsWithMetrics } from "@/lib/data/products";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProductFormDialog, NewProductTrigger } from "@/components/products/product-form-dialog";
import { ProductsGrid } from "@/components/products/products-grid";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const ctx = await requireContext();
  const products = await listProductsWithMetrics(ctx.workspace.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos digitais vendidos na sua operação"
        actions={<ProductFormDialog trigger={<NewProductTrigger />} allProducts={products} />}
      />
      <ProductsGrid products={products} />
    </div>
  );
}
