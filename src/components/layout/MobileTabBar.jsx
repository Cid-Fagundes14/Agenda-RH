import { Link } from "@tanstack/react-router";
import { NAV_ITEMS } from "@/components/layout/AppSidebar";

export default function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border bg-white lg:hidden">
      <div className="grid h-full grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
