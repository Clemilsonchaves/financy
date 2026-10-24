import { Link } from "react-router-dom";
import { brl, fmtDate } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useTransactions } from "../lib/queries";
import { PageHeader } from "../components/Layout";

export function Dashboard() {
  const { user } = useAuth();
  const { data = [], isLoading } = useTransactions();

  const income = data.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const expense = data.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, number>();
  data
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      const k = t.category?.name ?? "Sem categoria";
      byCategory.set(k, (byCategory.get(k) ?? 0) + t.amount);
    });
  const top = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const cards = [
    { label: "Saldo total", value: income - expense, color: "text-ink" },
    { label: "Receitas", value: income, color: "text-brand-600" },
    { label: "Despesas", value: expense, color: "text-red-600" },
  ];

  return (
    <>
      <PageHeader title={`Olá, ${user?.name.split(" ")[0]}`} subtitle="Resumo das suas finanças" />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className={`mt-1 text-2xl font-bold ${c.color}`}>{brl(c.value)}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-semibold">Últimas transações</h2>
            <Link to="/transactions" className="text-sm font-medium text-brand-700">
              Ver todas
            </Link>
          </div>
          {isLoading && <p className="p-4 text-sm text-muted">Carregando...</p>}
          {!isLoading && data.length === 0 && <p className="p-4 text-sm text-muted">Sem transações.</p>}
          <div className="divide-y divide-line">
            {data.slice(0, 6).map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{t.description}</p>
                  <p className="text-sm text-muted">
                    {fmtDate(t.date)} · {t.category?.name ?? "Sem categoria"}
                  </p>
                </div>
                <span className={`font-semibold ${t.type === "INCOME" ? "text-brand-600" : "text-red-600"}`}>
                  {t.type === "INCOME" ? "+" : "-"} {brl(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="font-semibold">Despesas por categoria</h2>
            <Link to="/categories" className="text-sm font-medium text-brand-700">
              Gerenciar
            </Link>
          </div>
          <div className="space-y-3 p-4">
            {top.length === 0 && <p className="text-sm text-muted">Sem despesas.</p>}
            {top.map(([name, value]) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted">{brl(value)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${(value / expense) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
