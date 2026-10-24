import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/transactions", label: "Transações" },
  { to: "/categories", label: "Categorias" },
];

export function Layout() {
  const { user } = useAuth();
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-xl font-bold text-brand-700">Financy</span>
          <nav className="flex gap-1 text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 ${isActive ? "bg-brand-50 font-medium text-brand-700" : "text-muted hover:text-ink"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700"
            title="Perfil"
          >
            {initials}
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
