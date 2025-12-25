import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, ArrowLeft, Quote, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Auth() {
  const { user, login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030712]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#030712] overflow-hidden font-sans text-foreground selection:bg-purple-500/30">

      {/* LEFT SIDE - FORM */}
      <div className="relative flex flex-col items-center justify-center p-8 lg:p-12">
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2 pl-0">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm space-y-8 relative z-10"
        >
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl shadow-purple-500/20 mb-4">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-zinc-400">Enter your details to access your workspace.</p>
          </div>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/5 p-1 h-auto rounded-lg">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2.5 transition-all font-medium"
                  >
                    Log In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg py-2.5 transition-all font-medium"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-11 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Password</Label>
                        <span className="text-xs text-purple-400 cursor-pointer hover:text-purple-300 transition-colors">Forgot password?</span>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-11 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white h-11 font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                      disabled={login.isPending}
                    >
                      {login.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username" className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Username</Label>
                      <Input
                        id="reg-username"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-11 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="bg-white/5 border-white/10 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 h-11 text-white placeholder:text-zinc-600"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white h-11 font-semibold shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                      disabled={register.isPending}
                    >
                      {register.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Free Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="px-8 text-center text-sm text-zinc-500">
            By clicking continue, you agree to our <span className="hover:text-white underline underline-offset-4 cursor-pointer">Terms of Service</span> and <span className="hover:text-white underline underline-offset-4 cursor-pointer">Privacy Policy</span>.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE - VISUAL */}
      <div className="hidden lg:flex relative flex-col justify-center p-12 bg-zinc-900 overflow-hidden">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[#0A0A0A]">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-lg mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-[1.1]">
              Convert messy thoughts into <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">viral content</span>.
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Join thousands of creators who use BrandVoice to scale their audience 10x faster without sounding like a generic AI.
            </p>
          </motion.div>

          {/* Testimonial Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative"
          >
            <Quote className="absolute -top-4 -left-4 w-10 h-10 text-purple-500 fill-current opacity-50" />
            <p className="text-lg text-zinc-200 mb-6 relative z-10 italic">
              "This is hands down the best tool I've used for LinkedIn content. It actually sounds like me, but smarter and faster."
            </p>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 border border-white/10" />
              <div>
                <div className="font-semibold text-white">Alex Chen</div>
                <div className="text-sm text-zinc-500">Growth Design Lead</div>
              </div>
            </div>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            {[
              "Custom Brand Voices",
              "One-Click Rewrites",
              "Multi-Platform Support",
              "Viral Hook Library"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-zinc-400">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

    </div>
  );
}
