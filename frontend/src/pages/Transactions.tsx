import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Q, Transaction, brl, gql } from "../lib/api";
import { categoryStyle } from "../lib/categoryStyle";
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

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium">{label}</span>
      <span className="relative block">
        <select
          className="input h-10 appearance-none pr-9 text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
      </span>
    </label>
  );
}

function PageButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-7 min-w-7 items-center justify-center rounded-md border px-2 text-xs font-medium disabled:opacity-40 ${
        active ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-white text-ink hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export function Transactions() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useTransactions();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = useState<Transaction | "new" | null>(
    searchParams.get("new") ? "new" : null,
  );
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [period, setPeriod] = useState("");
  const [page, setPage] = useState(1);
  const { data: categories = [] } = useCategories();

  const closeDialog = () => {
    setEditing(null);
    if (searchParams.has("new")) setSearchParams({}, { replace: true });
  };

  const monthKey = (iso: string) => iso.slice(0, 7);
  const periods = [...new Set(data.map((t) => monthKey(t.date)))].sort().reverse();
  const periodLabel = (key: string) => {
    const [y, m] = key.split("-");
    const name = new Date(Date.UTC(+y, +m - 1, 1)).toLocaleDateString("pt-BR", {
      month: "long",
      timeZone: "UTC",
    });
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} / ${y}`;
  };

  const filtered = data.filter(
    (t) =>
      t.description.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!typeFilter || t.type === typeFilter) &&
      (!categoryFilter || t.category?.id === categoryFilter) &&
      (!period || monthKey(t.date) === period),
  );
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);
  const shortDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "UTC" });
  const onFilter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

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
        subtitle="Gerencie todas as suas transações financeiras"
        action={
          <button className="auth-submit gap-1.5 !h-9 !px-3 !text-xs" onClick={() => setEditing("new")}>
            <Plus size={14} /> Nova transação
          </button>
        }
      />

      <div className="card mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Buscar</span>
          <span className="relative block">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input h-10 pl-9 text-xs"
              placeholder="Buscar por descrição"
              value={search}
              onChange={(e) => onFilter(setSearch)(e.target.value)}
            />
          </span>
        </label>
        <FilterSelect label="Tipo" value={typeFilter} onChange={onFilter(setTypeFilter)}>
          <option value="">Todos</option>
          <option value="INCOME">Entrada</option>
          <option value="EXPENSE">Saída</option>
        </FilterSelect>
        <FilterSelect label="Categoria" value={categoryFilter} onChange={onFilter(setCategoryFilter)}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Período" value={period} onChange={onFilter(setPeriod)}>
          <option value="">Todos</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {periodLabel(p)}
            </option>
          ))}
        </FilterSelect>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] font-medium uppercase tracking-wider text-muted">
                <th className="px-5 py-4 text-left font-medium">Descrição</th>
                <th className="px-3 py-4 text-center font-medium">Data</th>
                <th className="px-3 py-4 text-center font-medium">Categoria</th>
                <th className="px-3 py-4 text-center font-medium">Tipo</th>
                <th className="px-3 py-4 text-right font-medium">Valor</th>
                <th className="px-5 py-4 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((t) => {
                const { badge, tile, Icon } = categoryStyle(t.category?.name);
                const income = t.type === "INCOME";
                const Arrow = income ? ArrowUpCircle : ArrowDownCircle;
                return (
                  <tr key={t.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile}`}>
                          <Icon size={14} />
                        </span>
                        <span className="font-medium">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-muted">{shortDate(t.date)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
                        {t.category?.name ?? "Sem categoria"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`flex items-center justify-center gap-1.5 text-xs font-medium ${income ? "text-brand-700" : "text-red-600"}`}
                      >
                        <Arrow size={14} /> {income ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-xs font-semibold">
                      {income ? "+" : "-"} {brl(t.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label="Excluir"
                          title="Excluir"
                          onClick={() => setDeleting(t)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                        </button>
                        <button
                          aria-label="Editar"
                          title="Editar"
                          onClick={() => setEditing(t)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-line text-gray-600 hover:bg-gray-50"
                        >
                          <SquarePen size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isLoading && <p className="p-6 text-sm text-muted">Carregando...</p>}
        {!isLoading && rows.length === 0 && (
          <p className="p-6 text-sm text-muted">
            {data.length === 0 ? "Nenhuma transação cadastrada." : "Nenhuma transação encontrada."}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-4 text-xs text-muted">
          <span>
            {filtered.length === 0 ? 0 : start + 1} a {start + rows.length} | {filtered.length} resultados
          </span>
          <div className="flex items-center gap-1.5">
            <PageButton disabled={current === 1} onClick={() => setPage(current - 1)} label="Anterior">
              <ChevronLeft size={14} />
            </PageButton>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <PageButton key={n} active={n === current} onClick={() => setPage(n)} label={`Página ${n}`}>
                {n}
              </PageButton>
            ))}
            <PageButton disabled={current === pageCount} onClick={() => setPage(current + 1)} label="Próxima">
              <ChevronRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>
      {editing && (
        <TransactionDialog tx={editing === "new" ? undefined : editing} onClose={closeDialog} />
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
