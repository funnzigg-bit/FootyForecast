import { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Radio, BarChart3, TrendingUp,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, Target, Flame, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: ReactNode;
  liveMatchCount?: number;
}

const navItems = [
  { icon: LayoutDashboard, label: "Predictions", path: "/predictions" },
  { icon: Radio, label: "Live", path: "/live" },
  { icon: Target, label: "Daily Picks", path: "/daily-picks" },
  { icon: Flame, label: "Upset Watch", path: "/upset-watch" },
  { icon: BarChart3, label: "Goals Market", path: "/goals-market" },
  { icon: BookOpen, label: "Methodology", path: "/methodology" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const SidebarContent = ({
  collapsed,
  location,
  onSignOut,
  onToggle,
  onNavClick,
}: {
  collapsed: boolean;
  location: ReturnType<typeof useLocation>;
  onSignOut: () => void;
  onToggle?: () => void;
  onNavClick?: () => void;
}) => (
  <>
    <div className="flex h-14 items-center justify-between border-b border-border px-3">
      {!collapsed && (
        <Link to="/predictions" className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            Footy<span className="text-primary">Forecast</span>
          </span>
        </Link>
      )}
      {collapsed && (
        <span className="mx-auto text-sm font-bold tracking-tight text-foreground">
          F<span className="text-primary">F</span>
        </span>
      )}
    </div>

    <div className={cn("flex items-center gap-2 border-b border-border px-3 py-2", collapsed && "justify-center")}>
      <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
      {!collapsed && <span className="text-xs font-mono text-primary">FREE ACCESS</span>}
    </div>

    <nav className="flex-1 space-y-1 p-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>

    <div className="border-t border-border p-2 space-y-1">
      <button
        onClick={onSignOut}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors",
          collapsed && "justify-center px-2"
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>
      {onToggle && (
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </div>
  </>
);

const DashboardLayout = ({ children, liveMatchCount }: DashboardLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          location={location}
          onSignOut={handleSignOut}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0 bg-card border-border md:hidden">
          <div className="flex h-full flex-col">
            <SidebarContent
              collapsed={false}
              location={location}
              onSignOut={handleSignOut}
              onNavClick={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <main className={cn("flex-1 transition-all duration-300", collapsed ? "md:ml-16" : "md:ml-60")}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {navItems.find(n => n.path === location.pathname)?.label || "Predictions"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
              Updated today
            </div>
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
