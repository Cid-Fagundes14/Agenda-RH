import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/components/layout/AppSidebar";

export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 h-16 bg-sidebar lg:hidden">
      <div className="grid h-full grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="agenda-nav-link mb-1 flex flex-col items-center justify-center gap-1 rounded-b-lg text-[10px] min-[400px]:text-[11px] font-medium"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
