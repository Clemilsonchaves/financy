import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownUp, Plus, SquarePen, Tag, Trash2 } from "lucide-react";
import { Category, Q, gql } from "../lib/api";
import { COLOR_OPTIONS, ICON_OPTIONS, categoryStyle } from "../lib/categoryStyle";
import { useCategories, useTransactions } from "../lib/queries";
import { Confirm, Modal } from "../components/Modal";
import { PageHeader } from "../components/Layout";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o título"),
  description: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function CategoryDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const [icon, setIcon] = useState<string | null>(category ? category.icon : "briefcase");
  const [color, setColor] = useState<string | null>(category ? category.color : "green");
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? "", description: category?.description ?? "" },
  });

  const save = useMutation({
    mutationFn: (v: Form) => {
      const vars = { ...v, icon: icon ?? undefined, color: color ?? undefined };
      return category ? gql(Q.updateCategory, { id: category.id, ...vars }) : gql(Q.createCategory, vars);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  const selected = "border-brand-700 ring-1 ring-brand-700";

  return (
    <Modal
      title={category ? "Editar categoria" : "Nova categoria"}
      subtitle="Organize suas transações com categorias"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
        <div>
          <label className="label text-xs">Título</label>
          <input className="input h-11 text-sm" placeholder="Ex. Alimentação" {...register("name")} />
          <p className="field-error">{formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="label text-xs">Descrição</label>
          <input className="input h-11 text-sm" placeholder="Descrição da categoria" {...register("description")} />
          <p className="mt-1 text-[11px] text-muted">Opcional</p>
        </div>
        <div>
          <span className="label text-xs">Ícone</span>
          <div className="grid grid-cols-8 gap-2">
            {Object.entries(ICON_OPTIONS).map(([key, Icon]) => (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
                className={`flex h-10 items-center justify-center rounded-lg border bg-white text-gray-600 hover:bg-gray-50 ${
                  icon === key ? selected : "border-line"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="label text-xs">Cor</span>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(COLOR_OPTIONS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                aria-label={key}
                aria-pressed={color === key}
                onClick={() => setColor(key)}
                className={`flex h-7 items-center justify-center rounded-lg border bg-white px-1.5 ${
                  color === key ? selected : "border-line"
                }`}
              >
                <span className={`h-3.5 w-full rounded ${c.swatch}`} />
              </button>
            ))}
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button className="auth-submit h-11 w-full" disabled={save.isPending}>
          Salvar
        </button>
      </form>
    </Modal>
  );
}

export function Categories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const counts = new Map<string, number>();
  transactions.forEach((t) => {
    if (t.category) counts.set(t.category.id, (counts.get(t.category.id) ?? 0) + 1);
  });
  const mostUsed = data.reduce<Category | null>(
    (best, c) => ((counts.get(c.id) ?? 0) > (best ? (counts.get(best.id) ?? 0) : 0) ? c : best),
    null,
  );
  const MostUsedIcon = categoryStyle(mostUsed).Icon;
  const MostUsedTile = categoryStyle(mostUsed).tile;

  const del = useMutation({
    mutationFn: (id: string) => gql(Q.deleteCategory, { id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setDeleting(null);
    },
  });

  return (
    <>
      <PageHeader
        title="Categorias"
        subtitle="Organize suas transações por categorias"
        action={
          <button className="auth-submit gap-1.5 !h-9 !px-3 !text-xs" onClick={() => setEditing("new")}>
            <Plus size={14} /> Nova categoria
          </button>
        }
      />

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <div className="card flex items-center gap-4 p-6">
          <Tag size={22} className="text-gray-600" />
          <div>
            <p className="text-2xl font-bold">{data.length}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Total de categorias</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <ArrowDownUp size={22} className="text-purple-600" />
          <div>
            <p className="text-2xl font-bold">{transactions.length}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Total de transações</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-6">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${mostUsed ? MostUsedTile : ""}`}>
            <MostUsedIcon size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-2xl font-bold">{mostUsed?.name ?? "—"}</p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted">Categoria mais utilizada</p>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-sm text-muted">Carregando...</p>}
      {!isLoading && data.length === 0 && (
        <p className="card p-6 text-sm text-muted">Nenhuma categoria cadastrada.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((c) => {
          const { Icon, tile, badge } = categoryStyle(c);
          const count = counts.get(c.id) ?? 0;
          return (
            <div key={c.id} className="card flex min-h-[198px] flex-col p-5">
              <div className="flex items-start justify-between">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tile}`}>
                  <Icon size={16} />
                </span>
                <div className="flex gap-2">
                  <button
                    aria-label="Excluir"
                    title="Excluir"
                    onClick={() => setDeleting(c)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    aria-label="Editar"
                    title="Editar"
                    onClick={() => setEditing(c)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-gray-600 hover:bg-gray-50"
                  >
                    <SquarePen size={13} />
                  </button>
                </div>
              </div>
              <h2 className="mt-4 font-semibold">{c.name}</h2>
              <p className="mt-1 text-sm text-muted">{c.description}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>{c.name}</span>
                <span className="text-sm text-muted">
                  {count} {count === 1 ? "item" : "itens"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <CategoryDialog
          category={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <Confirm
          message={`Deseja excluir a categoria "${deleting.name}"? As transações ficarão sem categoria.`}
          loading={del.isPending}
          onConfirm={() => del.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
