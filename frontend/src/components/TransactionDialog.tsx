import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownCircle, ArrowUpCircle, ChevronDown } from "lucide-react";
import { Q, Transaction, gql } from "../lib/api";
import { useCategories } from "../lib/queries";
import { Modal } from "./Modal";

const schema = z.object({
  description: z.string().trim().min(1, "Informe a descrição"),
  amount: z.coerce.number().positive("Informe um valor maior que zero"),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string().min(1, "Informe a data"),
  categoryId: z.string().optional(),
});
type Form = z.input<typeof schema>;
type Parsed = z.output<typeof schema>;

export function TransactionDialog({ tx, onClose }: { tx?: Transaction; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: categories = [] } = useCategories();
  const [error, setError] = useState("");
  const { register, handleSubmit, watch, setValue, formState } = useForm<Form, unknown, Parsed>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: tx?.description ?? "",
      amount: tx?.amount ?? ("" as unknown as number),
      type: tx?.type ?? "EXPENSE",
      date: tx ? tx.date.slice(0, 10) : "",
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

  const options = [
    { value: "EXPENSE", label: "Despesa", Icon: ArrowDownCircle, active: "border-red-500 text-ink [&>svg]:text-red-600" },
    { value: "INCOME", label: "Receita", Icon: ArrowUpCircle, active: "border-brand-700 text-ink [&>svg]:text-brand-700" },
  ] as const;

  return (
    <Modal
      title={tx ? "Editar transação" : "Nova transação"}
      subtitle="Registre sua despesa ou receita"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line p-1.5 text-sm">
          {options.map(({ value, label, Icon, active }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("type", value)}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg border font-medium transition ${
                type === value ? `bg-gray-50 ${active}` : "border-transparent text-muted"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <div>
          <label className="label text-xs">Descrição</label>
          <input className="input h-11 text-sm" placeholder="Ex. Almoço no restaurante" {...register("description")} />
          <p className="field-error">{formState.errors.description?.message}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label text-xs">Data</label>
            <input className="input h-11 text-sm" type="date" {...register("date")} />
            <p className="field-error">{formState.errors.date?.message}</p>
          </div>
          <div>
            <label className="label text-xs">Valor</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink">R$</span>
              <input
                className="input h-11 pl-10 text-sm"
                type="number"
                step="0.01"
                placeholder="0,00"
                {...register("amount")}
              />
            </div>
            <p className="field-error">{formState.errors.amount?.message}</p>
          </div>
        </div>
        <div>
          <label className="label text-xs">Categoria</label>
          <div className="relative">
            <select className="input h-11 appearance-none pr-9 text-sm" {...register("categoryId")}>
              <option value="">Selecione</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
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
