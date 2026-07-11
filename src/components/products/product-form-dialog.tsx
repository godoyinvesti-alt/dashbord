"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { createProductAction, updateProductAction } from "@/lib/actions/products";
import { STATUS_PRODUTO_LABEL } from "@/lib/constants";
import type { Product } from "@/lib/types";

export function ProductFormDialog({
  trigger,
  product,
  allProducts,
}: {
  trigger: React.ReactNode;
  product?: Product;
  allProducts: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          nome: product.nome,
          categoria: product.categoria ?? "",
          descricao: product.descricao ?? "",
          preco_principal: Number(product.preco_principal),
          custo: Number(product.custo),
          status: product.status,
          link_entrega: product.link_entrega ?? "",
          upsells_relacionados: product.upsells_relacionados ?? [],
          order_bumps: product.order_bumps ?? [],
        }
      : {
          nome: "",
          categoria: "",
          descricao: "",
          preco_principal: 0,
          custo: 0,
          status: "ativo",
          link_entrega: "",
          upsells_relacionados: [],
          order_bumps: [],
        },
  });

  const otherProducts = allProducts.filter((p) => p.id !== product?.id);
  const upsells = watch("upsells_relacionados");
  const bumps = watch("order_bumps");

  function toggle(list: string[], id: string, field: "upsells_relacionados" | "order_bumps") {
    setValue(field, list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  }

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, values)
        : await createProductAction(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Produto atualizado." : "Produto criado.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>Cadastre os produtos digitais vendidos pelo WhatsApp.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome" error={errors.nome?.message} full>
              <Input {...register("nome")} placeholder="Nome do produto" />
            </Field>
            <Field label="Categoria">
              <Input {...register("categoria")} placeholder="Ex.: Curso, Ebook..." />
            </Field>
            <Field label="Status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_PRODUTO_LABEL).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Preço principal (R$)" error={errors.preco_principal?.message}>
              <Input type="number" step="0.01" {...register("preco_principal", { valueAsNumber: true })} />
            </Field>
            <Field label="Custo (R$)" error={errors.custo?.message}>
              <Input type="number" step="0.01" {...register("custo", { valueAsNumber: true })} />
            </Field>
            <Field label="Link de entrega" full>
              <Input {...register("link_entrega")} placeholder="https://..." />
            </Field>
            <Field label="Descrição" full>
              <Textarea {...register("descricao")} rows={3} />
            </Field>

            {otherProducts.length > 0 && (
              <>
                <Field label="Upsells relacionados" full>
                  <div className="flex flex-wrap gap-1.5">
                    {otherProducts.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggle(upsells, p.id, "upsells_relacionados")}
                      >
                        <Badge variant={upsells.includes(p.id) ? "default" : "outline"}>{p.nome}</Badge>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Order bumps" full>
                  <div className="flex flex-wrap gap-1.5">
                    {otherProducts.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => toggle(bumps, p.id, "order_bumps")}
                      >
                        <Badge variant={bumps.includes(p.id) ? "default" : "outline"}>{p.nome}</Badge>
                      </button>
                    ))}
                  </div>
                </Field>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {product ? "Salvar alterações" : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
  full,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function NewProductTrigger() {
  return (
    <Button className="gap-1.5">
      <Plus className="size-4" /> Novo produto
    </Button>
  );
}
