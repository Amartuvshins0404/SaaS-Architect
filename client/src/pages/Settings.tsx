import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [upgrading, setUpgrading] = useState(false);

  // Check for success/canceled params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && params.get("session_id")) {
      const verifyPayment = async () => {
        try {
          const res = await apiRequest("POST", "/api/verify-checkout", {
            session_id: params.get("session_id")
          });
          const data = await res.json();

          if (data.success) {
            toast({ title: "Success", description: "Your Pro plan is active!" });
            // Clean URL
            window.history.replaceState(null, "", window.location.pathname);
            // Reload to update UI state
            setTimeout(() => window.location.reload(), 1000);
          } else {
            toast({
              variant: "destructive",
              title: "Verification Incomplete",
              description: `Status: ${data.status}. Please try again later or contact support.`
            });
          }
        } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Verification Failed", description: "Could not verify payment." });
        }
      };
      verifyPayment();
    }
  }, []);

  const handleUpgradePlan = async () => {
    setUpgrading(true);
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
        description: error.message || "Failed to start checkout"
      });
      setUpgrading(false);
    }
  };

  const handleCancelPlan = async () => {
    setUpgrading(true);
    try {
      await apiRequest("POST", "/api/cancel-subscription");
      toast({ title: "Success", description: "Subscription canceled. You formely downgraded to the Free plan." });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to cancel subscription"
      });
      setUpgrading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({ variant: "destructive", title: "Error", description: "All fields are required" });
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/user/password", {
        currentPassword,
        newPassword
      });

      toast({
        title: "Success",
        description: "Your password has been updated securely."
      });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const isPro = user?.subscriptionTier === "pro";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-muted-foreground">
            Manage your account preferences and subscription.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Profile
              </CardTitle>
              <CardDescription>Your personal account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input value={user?.username} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label>Account ID</Label>
                <Input value={user?.id} disabled className="bg-muted" />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Subscription
              </CardTitle>
              <CardDescription>Manage your billing and plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isPro ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 px-3 py-1.5 rounded-full w-fit">
                    <Shield className="h-4 w-4" />
                    Pro Plan Active
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will lose access to premium features immediately. Your account will revert to the Free plan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelPlan} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {upgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Confirm Cancellation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                  <div>
                    <p className="font-medium">Free Plan</p>
                    <p className="text-sm text-muted-foreground">Upgrade to unlock full potential</p>
                  </div>
                  <Button onClick={handleUpgradePlan} disabled={upgrading} className="shadow-lg shadow-primary/25">
                    {upgrading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    {user?.hasUsedTrial ? "Upgrade to Pro" : "Start 7-Day Free Trial"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Security
              </CardTitle>
              <CardDescription>Password and authentication settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  data-testid="button-change-password"
                >
                  Change Password
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="current-pwd">Current Password</Label>
                    <Input
                      id="current-pwd"
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-pwd">New Password</Label>
                    <Input
                      id="new-pwd"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      data-testid="button-save-password"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
