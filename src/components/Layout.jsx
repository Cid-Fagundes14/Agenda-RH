import { Link, Outlet } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { useAuth } from "@/lib/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-card dark:bg-background">
      <AppSidebar user={user} onLogout={() => logout()} />
      <header className="flex min-h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground lg:hidden">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-bold">
          <img src="/agenda-rh-icon.png" alt="" width={28} height={28} className="rounded-md" />
          Agenda de RH
        </Link>
        <Link
          to="/conta"
          aria-label="Minha conta"
          className="agenda-nav-link grid size-11 place-items-center rounded-md"
        >
          <Settings className="size-5" aria-hidden="true" />
        </Link>
      </header>
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
