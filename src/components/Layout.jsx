import { Outlet } from "@tanstack/react-router";
import AppSidebar from "@/components/layout/AppSidebar";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { useAuth } from "@/lib/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <AppSidebar user={user} onLogout={() => logout()} />
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
