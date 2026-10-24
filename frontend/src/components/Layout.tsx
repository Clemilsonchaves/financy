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
    <div className="min-h-screen bg-[#f8f9fb]">
      <header className="border-b border-line bg-white">
        <div className="mx-auto grid h-[60px] max-w-[1080px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
          <img src="/logo.png" alt="Financy" className="h-6 w-auto justify-self-start" />
          <nav className="flex gap-5 text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  isActive ? "font-medium text-brand-700" : "text-muted hover:text-ink"
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/profile"
            className="flex h-8 w-8 items-center justify-center justify-self-end rounded-full bg-gray-300 text-xs font-semibold text-ink"
            title="Perfil"
          >
            {initials}
          </NavLink>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-4 py-10">
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
