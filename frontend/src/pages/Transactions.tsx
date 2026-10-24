import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Q, Transaction, brl, fmtDate, gql } from "../lib/api";
import { useCategories, useTransactions } from "../lib/queries";
import { Confirm, Modal } from "../components/Modal";
import { PageHeader } from "../components/Layout";

const schema = z.object({
  description: z.string().trim().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Informe a data"),
  categoryId: z.string().optional(),
});
type Form = z.input<typeof schema>;
type Parsed = z.output<typeof schema>;

function TransactionDialog({ tx, onClose }: { tx?: Transaction; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, setValue, formState } = useForm<Form, unknown, Parsed>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: tx?.description ?? "",
      amount: tx?.amount ?? ("" as unknown as number),
      type: tx?.type ?? "EXPENSE",
      date: (tx?.date ?? new Date().toISOString()).slice(0, 10),
      categoryId: tx?.category?.id ?? "",
    },
  });
  const type = watch("type");

  const save = useMutation({
    mutationFn: (v: Parsed) => {
      const vars = { ...v, categoryId: v.categoryId || null, date: new Date(v.date).toISOString() };
      return tx ? gql(Q.updateTransaction, { id: tx.id, ...vars }) : gql(Q.createTransaction, vars);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  return (
    <Modal title={tx ? "Editar transação" : "Nova transação"} onClose={onClose}>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-line p-1 text-sm">
          {(["EXPENSE", "INCOME"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("type", t)}
              className={`rounded-md py-2 font-medium ${
                type === t
                  ? t === "INCOME"
                    ? "bg-brand-600 text-white"
                    : "bg-red-600 text-white"
                  : "text-muted"
              }`}
            >
              {t === "INCOME" ? "Receita" : "Despesa"}
            </button>
          ))}
        </div>
        <div>
          <label className="label">Descrição</label>
          <input className="input" placeholder="Ex.: Almoço" {...register("description")} />
          <p className="field-error">{formState.errors.description?.message}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor (R$)</label>
            <input className="input" type="number" step="0.01" placeholder="0,00" {...register("amount")} />
            <p className="field-error">{formState.errors.amount?.message}</p>
          </div>
          <div>
            <label className="label">Data</label>
            <input className="input" type="date" {...register("date")} />
            <p className="field-error">{formState.errors.date?.message}</p>
          </div>
        </div>
        <div>
          <label className="label">Categoria</label>
          <select className="input" {...register("categoryId")}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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

export function Transactions() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useTransactions();
  const [editing, setEditing] = useState<Transaction | "new" | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => gql(Q.deleteTransaction, { id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setDeleting(null);
    },
  });

  return (
    <>
      <PageHeader
        title="Transações"
        subtitle="Gerencie suas receitas e despesas"
        action={
          <button className="btn-primary" onClick={() => setEditing("new")}>
            + Nova transação
          </button>
        }
      />
      <div className="card divide-y divide-line">
        {isLoading && <p className="p-6 text-sm text-muted">Carregando...</p>}
        {!isLoading && data.length === 0 && (
          <p className="p-6 text-sm text-muted">Nenhuma transação cadastrada.</p>
        )}
        {data.map((t) => (
          <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{t.description}</p>
              <p className="text-sm text-muted">
                {fmtDate(t.date)} · {t.category?.name ?? "Sem categoria"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${t.type === "INCOME" ? "text-brand-600" : "text-red-600"}`}>
                {t.type === "INCOME" ? "+" : "-"} {brl(t.amount)}
              </span>
              <button className="btn-outline" onClick={() => setEditing(t)}>
                Editar
              </button>
              <button className="btn-outline text-red-600" onClick={() => setDeleting(t)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <TransactionDialog tx={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />
      )}
      {deleting && (
        <Confirm
          message={`Deseja excluir a transação "${deleting.description}"?`}
          loading={del.isPending}
          onConfirm={() => del.mutate(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
