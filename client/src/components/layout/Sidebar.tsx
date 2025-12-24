import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mic2,
  History,
  Settings,
  LogOut,
  Sparkles,
  Command
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Brand Voices", href: "/app/voices", icon: Mic2 },
    { name: "History", href: "/app/history", icon: History },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border/50">
      {/* Logo Area */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-5 w-5 text-primary-foreground fill-current" />
        </div>
        <span className="font-display text-lg font-bold text-foreground tracking-tight">
          BrandVoice
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Area */}
      <div className="p-4 m-4 rounded-xl bg-card border border-primary/20 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Command className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium text-foreground truncate">My Workspace</p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8"
          onClick={() => logout.mutate()}
        >
          <LogOut className="h-3 w-3" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
