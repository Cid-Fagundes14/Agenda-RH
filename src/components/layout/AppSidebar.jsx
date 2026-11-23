import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, FolderKanban, LogOut, Settings, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Hoje", icon: Sun },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/calendario", label: "Calendário", icon: CalendarDays },
];

export default function AppSidebar({ user, onLogout }) {
  const initials = (user?.full_name || user?.email || "RH")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-foreground">
          Agenda de RH
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            activeProps={{ className: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground" }}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          to="/conta"
          className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-secondary"
          activeProps={{ className: "bg-secondary" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {user?.full_name || "Minha conta"}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
          </span>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export function navItemClass() {
  return cn("flex min-h-11 items-center gap-3 rounded-md px-3");
}
