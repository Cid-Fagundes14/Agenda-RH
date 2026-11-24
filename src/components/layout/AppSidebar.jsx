import { Link } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, FolderKanban, GraduationCap, LogOut, Settings, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Hoje", icon: Sun },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/solicitacoes", label: "Solicitações", icon: GraduationCap },
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
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight text-sidebar-foreground">
          Agenda de RH
        </Link>
      </div>

      <nav className="flex-1 space-y-1 py-4 pl-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="agenda-nav-link flex min-h-11 items-center gap-3 rounded-l-lg px-3 text-sm font-medium"
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border py-3 pl-3">
        <Link
          to="/conta"
          className="agenda-nav-link flex items-center gap-3 rounded-l-lg py-2 pl-2 pr-3"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user?.full_name || "Minha conta"}
            </span>
            <span className="block truncate text-xs">{user?.email}</span>
          </span>
          <Settings className="h-4 w-4 shrink-0" />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="agenda-nav-link mt-1 flex min-h-11 w-full items-center gap-3 rounded-l-lg px-3 text-sm font-medium"
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
