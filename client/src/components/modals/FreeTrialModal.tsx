import { useRef, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FreeTrialModal() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [doNotShowAgain, setDoNotShowAgain] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        // Show if:
        // 1. User is logged in
        // 2. User is on 'free' plan
        // 3. User has NOT hidden this modal (db preference)
        // 4. User has NOT used trial before
        if (user && user.subscriptionTier === 'free' && !user.hideTrialModal && !user.hasUsedTrial) {
            // Add a small delay for better UX (don't pop up INSTANTLY on load)
            const timer = setTimeout(() => setOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleStartTrial = async () => {
        setLoading(true);
        try {
            const res = await apiRequest("POST", "/api/create-checkout-session");
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to start trial"
            });
            setLoading(false);
        }
    };

    const handleClose = async (isOpen: boolean) => {
        if (isOpen) return; // Only handle closing

        setOpen(false);

        if (doNotShowAgain) {
            try {
                await apiRequest("POST", "/api/user/preferences", {
                    hideTrialModal: true
                });
                // Invalidate user query to update local state
                queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            } catch (err) {
                console.error("Failed to save preference", err);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md border-primary/20">
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-display">Upgrade to Pro</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        Unlock unlimited brand voices and rewrites. <br />
                        <span className="font-bold text-foreground">Try it free for 7 days.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm">Unlimited AI Rewrites</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                        <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm">Multiple Brand Voices</span>
                    </div>
                </div>

                <DialogFooter className="flex-col gap-2 sm:gap-0">
                    <Button onClick={handleStartTrial} className="w-full h-11 text-base shadow-lg shadow-primary/25" disabled={loading}>
                        {loading ? "Redirecting..." : "Start 7-Day Free Trial"}
                    </Button>

                    <div className="flex items-center justify-center gap-2 mt-4">
                        <Checkbox
                            id="dont-show"
                            checked={doNotShowAgain}
                            onCheckedChange={(c) => setDoNotShowAgain(!!c)}
                        />
                        <Label htmlFor="dont-show" className="text-sm text-muted-foreground font-normal cursor-pointer">
                            Don't show this again
                        </Label>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
