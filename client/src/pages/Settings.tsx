import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Shield, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpgradePlan = async () => {
    toast({ 
      title: "Coming Soon", 
      description: "Stripe integration for Pro plan upgrades is coming soon!" 
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({ 
        variant: "destructive",
        title: "Validation Error", 
        description: "Please fill in all fields." 
      });
      return;
    }
    setLoading(true);
    try {
      // Placeholder for password change - would need backend implementation
      toast({ 
        title: "Password Change", 
        description: "Password change feature coming soon!" 
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

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and subscription.</p>
        </header>

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
                <Input value={user?.username} disabled className="bg-muted/50" />
              </div>
              <div className="grid gap-2">
                <Label>Account ID</Label>
                <Input value={user?.id} disabled className="bg-muted/50 font-mono text-sm" />
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
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div>
                  <p className="font-medium text-lg">Current Plan: {user?.subscriptionTier || "Free"}</p>
                  <p className="text-sm text-muted-foreground">You are on the basic tier.</p>
                </div>
                <Button onClick={handleUpgradePlan} data-testid="button-upgrade-pro">Upgrade to Pro</Button>
              </div>
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
