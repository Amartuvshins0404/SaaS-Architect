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
  Command,
  MessageSquare,
  Globe,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    { name: "Brand Voices", href: "/app/voices", icon: Mic2 },
    { name: "Community", href: "/app/community", icon: Globe },
    { name: "History", href: "/app/history", icon: History },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/user-feedback", {
        message: feedbackText,
        category: "general"
      });

      toast({
        title: "Feedback sent",
        description: "Thank you for helping us improve!",
      });

      setFeedbackText("");
      setIsFeedbackOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
        <div className="p-4 m-4 rounded-xl bg-card border border-primary/20 shadow-lg shadow-black/20 space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <Command className="h-4 w-4 text-primary" />
            </div>
            <div className="text-sm overflow-hidden">
              <p className="font-medium text-foreground truncate">My Workspace</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user?.subscriptionTier || "free"} Plan
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10 h-8"
            onClick={() => setIsFeedbackOpen(true)}
          >
            <MessageSquare className="h-3 w-3" />
            Send Feedback
          </Button>

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

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent className="border-primary/20">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Encountered a bug or have a feature request? Let us know!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Message</Label>
              <Textarea
                id="feedback"
                placeholder="Describe your issue or idea..."
                className="min-h-[120px] bg-secondary/30 border-input/50 focus-visible:ring-primary/30"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={!feedbackText.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
