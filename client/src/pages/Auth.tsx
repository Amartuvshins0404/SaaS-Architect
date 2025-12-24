import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Redirect to="/app/dashboard" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ username, password });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync({ username, password });
      toast({ title: "Account created!", description: "Welcome to BrandVoice AI." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden selection:bg-primary/30">

      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[128px] -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-blue-600/5 rounded-full blur-[128px] translate-y-1/2 opacity-50" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="w-full max-w-sm relative z-10 mb-8 flex items-center gap-3 px-2">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <Sparkles className="h-5 w-5 text-primary-foreground fill-current" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight text-foreground">BrandVoice AI</span>
      </div>

      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-6 pt-8">
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-secondary/30 border-input/50 focus-visible:ring-primary/30 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Forgot password?</span>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/30 border-input/50 focus-visible:ring-primary/30 h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-10 font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                  disabled={login.isPending}
                >
                  {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/0 px-2 text-muted-foreground backdrop-blur-sm">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" type="button" className="w-full border-input/50 bg-secondary/30 hover:bg-secondary/50 h-10" disabled>
                  Google (Coming Soon)
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Username</Label>
                  <Input
                    id="reg-username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-secondary/30 border-input/50 focus-visible:ring-primary/30 h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Password</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-secondary/30 border-input/50 focus-visible:ring-primary/30 h-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 h-10 font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
                  disabled={register.isPending}
                >
                  {register.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="mt-8 flex gap-6 text-sm text-muted-foreground/60">
        <span className="hover:text-muted-foreground cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-muted-foreground cursor-pointer transition-colors">Terms of Service</span>
        <span className="hover:text-muted-foreground cursor-pointer transition-colors">Contact</span>
      </div>
    </div>
  );
}
