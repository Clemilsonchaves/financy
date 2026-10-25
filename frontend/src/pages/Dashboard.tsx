import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, ChevronRight, Plus, Wallet } from "lucide-react";
import { brl, fmtDate } from "../lib/api";
import { categoryStyle } from "../lib/categoryStyle";
import { useCategories, useTransactions } from "../lib/queries";
import { TransactionDialog } from "../components/TransactionDialog";

export function Dashboard() {
  const { data = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const [creating, setCreating] = useState(false);

  const now = new Date();
  const inMonth = (iso: string) => {
    const d = new Date(iso);
    return d.getUTCFullYear() === now.getFullYear() && d.getUTCMonth() === now.getMonth();
  };
  const sum = (type: "INCOME" | "EXPENSE", onlyMonth: boolean) =>
    data
      .filter((t) => t.type === type && (!onlyMonth || inMonth(t.date)))
      .reduce((s, t) => s + t.amount, 0);

  const balance = sum("INCOME", false) - sum("EXPENSE", false);

  const cards = [
    { label: "Saldo total", value: balance, Icon: Wallet, color: "text-purple-600" },
    { label: "Receitas do mês", value: sum("INCOME", true), Icon: ArrowUpCircle, color: "text-brand-700" },
    { label: "Despesas do mês", value: sum("EXPENSE", true), Icon: ArrowDownCircle, color: "text-red-600" },
  ];

  const categoryStats = categories
    .map((c) => {
      const txs = data.filter((t) => t.category?.id === c.id);
      return { category: c, id: c.id, name: c.name, count: txs.length, total: txs.reduce((s, t) => s + t.amount, 0) };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {cards.map(({ label, value, Icon, color }) => (
        <div key={label} className="card p-5">
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted">
            <Icon size={16} className={color} />
            {label}
          </p>
          <p className="mt-3 text-[1.7rem] font-bold">{brl(value)}</p>
        </div>
      ))}

      <section className="card lg:col-span-2">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">Transações recentes</h2>
          <Link to="/transactions" className="flex items-center gap-1 text-sm font-medium text-brand-700">
            Ver todas <ChevronRight size={16} />
          </Link>
        </div>
        {isLoading && <p className="p-5 text-sm text-muted">Carregando...</p>}
        {!isLoading && data.length === 0 && <p className="p-5 text-sm text-muted">Sem transações.</p>}
        <div className="divide-y divide-line">
          {data.slice(0, 5).map((t) => {
            const { badge, tile, Icon } = categoryStyle(t.category);
            const income = t.type === "INCOME";
            const Arrow = income ? ArrowUpCircle : ArrowDownCircle;
            return (
              <div key={t.id} className="grid grid-cols-[1fr_auto_9.5rem] items-center gap-4 px-5 py-4">
                <div className="flex items-center gap-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tile}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{t.description}</p>
                    <p className="text-xs text-muted">{fmtDate(t.date)}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge}`}>
                  {t.category?.name ?? (income ? "Receita" : "Despesa")}
                </span>
                <span className="flex items-center justify-end gap-2 text-sm font-semibold">
                  {income ? "+" : "-"} {brl(t.amount)}
                  <Arrow size={16} className={income ? "text-brand-700" : "text-red-600"} />
                </span>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex w-full items-center justify-center gap-2 border-t border-line py-4 text-sm font-medium text-brand-700"
        >
          <Plus size={16} /> Nova transação
        </button>
      </section>

      <section className="card self-start">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">Categorias</h2>
          <Link to="/categories" className="flex items-center gap-1 text-sm font-medium text-brand-700">
            Gerenciar <ChevronRight size={16} />
          </Link>
        </div>
        <div className="space-y-3 p-5">
          {categoryStats.length === 0 && <p className="text-sm text-muted">Sem categorias.</p>}
          {categoryStats.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 text-sm">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${categoryStyle(c.category).badge}`}>
                {c.name}
              </span>
              <span className="ml-auto text-muted">
                {c.count} {c.count === 1 ? "item" : "itens"}
              </span>
              <span className="w-24 text-right font-semibold">{brl(c.total)}</span>
            </div>
          ))}
        </div>
      </section>
      {creating && <TransactionDialog onClose={() => setCreating(false)} />}
    </div>
  );
}
