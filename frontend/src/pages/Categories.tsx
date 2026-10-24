import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Q, gql } from "../lib/api";
import { useCategories } from "../lib/queries";
import { Confirm, Modal } from "../components/Modal";
import { PageHeader } from "../components/Layout";

const schema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  description: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function CategoryDialog({ category, onClose }: { category?: Category; onClose: () => void }) {
  const qc = useQueryClient();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: category?.name ?? "", description: category?.description ?? "" },
  });

  const save = useMutation({
    mutationFn: (v: Form) =>
      category
        ? gql(Q.updateCategory, { id: category.id, ...v })
        : gql(Q.createCategory, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  return (
    <Modal title={category ? "Editar categoria" : "Nova categoria"} onClose={onClose}>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
        <div>
          <label className="label">Nome</label>
          <input className="input" placeholder="Ex.: Alimentação" {...register("name")} />
          <p className="field-error">{formState.errors.name?.message}</p>
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" placeholder="Opcional" {...register("description")} />
        </div>
        {error && <p className="field-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" disabled={save.isPending}>
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function Categories() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useCategories();
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

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
        subtitle="Organize suas transações por categoria"
        action={
          <button className="btn-primary" onClick={() => setEditing("new")}>
            + Nova categoria
          </button>
        }
      />
      <div className="card divide-y divide-line">
        {isLoading && <p className="p-6 text-sm text-muted">Carregando...</p>}
        {!isLoading && data.length === 0 && (
          <p className="p-6 text-sm text-muted">Nenhuma categoria cadastrada.</p>
        )}
        {data.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              {c.description && <p className="text-sm text-muted">{c.description}</p>}
            </div>
            <div className="flex gap-2">
              <button className="btn-outline" onClick={() => setEditing(c)}>
                Editar
              </button>
              <button className="btn-outline text-red-600" onClick={() => setDeleting(c)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
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
