import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Cpu,
  Layers,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Twitter,
  Linkedin,
  Mail,
  PenTool,
  BrainCircuit,
  Lock,
  Wand2
} from "lucide-react";

export default function Landing() {
  const { data: products } = useQuery<any>({
    queryKey: ['/api/products'],
  });

  const proPrice = products?.[0]?.unit_amount
    ? `$${(products[0].unit_amount / 100).toFixed(2)}`
    : "$9.99";

  return (
    <div className="min-h-screen bg-[#030712] text-foreground font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light transition-opacity duration-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#030712]/60 backdrop-blur-xl supports-[backdrop-filter]:bg-[#030712]/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              BrandVoice
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5">
                Log In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          >
            <span className="flex h-2 w-2 rounded-full bg-purple-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(192,132,252,0.8)]" />
            New: Powered by Gemini 2.5 Flash
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto max-w-4xl font-display text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            Stop sounding like <br className="hidden lg:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-500 to-zinc-700">Generic AI.</span>
            <br />
            Start sounding like{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 blur-2xl opacity-30 animate-pulse"></span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
                You.
              </span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-zinc-400 mb-10 leading-relaxed"
          >
            Train our AI on your unique writing style in seconds. Generate authentic LinkedIn posts, tweets, and emails that barely need editing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-0 shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:scale-105"
              >
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-zinc-800 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
              >
                How it works
              </Button>
            </Link>
          </motion.div>

          {/* Dashboard Screenshot Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 50 }}
            className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden p-3"
          >
            {/* Top Gradient Border Helper */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

            {/* Inner Container */}
            <div className="relative rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5 shadow-inner">
              <img
                src="/image.png"
                alt="BrandVoice Dashboard Interface"
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
              />

              {/* Overlay Subtle Gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-20 pointer-events-none"></div>
            </div>

            {/* Glow underneath */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-2xl opacity-10 -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Partners / Social Proof */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-zinc-500 mb-8">TRUSTED BY CONTENT TEAMS AT</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple Text Placeholders for "Logos" to avoid external image deps issues */}
            <span className="text-xl font-bold text-zinc-300">ACME Corp</span>
            <span className="text-xl font-bold text-zinc-300">Stardust</span>
            <span className="text-xl font-bold text-zinc-300">Nebula</span>
            <span className="text-xl font-bold text-zinc-300">Vertex</span>
            <span className="text-xl font-bold text-zinc-300">Horizon</span>
          </div>
        </div>
      </section>

      {/* Main Features - Bento Grid */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-6">
              Everything you need to <span className="text-white">scale consistency</span>.
            </h2>
            <p className="text-lg text-zinc-400">
              Stop rewriting everything from scratch. Build your engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[300px]">
            {/* Main Feature - Large */}
            <div className="md:col-span-4 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                <BrainCircuit className="w-32 h-32 text-purple-500 rotate-12" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Wand2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Instant Style Match</h3>
                <p className="text-zinc-400 text-lg">Don't prompt engineering valid drafts. Just upload 3-5 examples of your best writing. We analyze sentence structure, vocabulary, and tone automatically.</p>
              </div>
            </div>

            {/* Feature 2 - Tall */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 relative overflow-hidden flex flex-col">
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="relative w-full aspect-square max-w-[200px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-[40px] opacity-40 animate-pulse"></div>
                  <div className="relative z-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full h-full flex flex-col gap-3">
                    <div className="w-full h-2 rounded-full bg-white/10"></div>
                    <div className="w-2/3 h-2 rounded-full bg-white/10"></div>
                    <div className="w-full h-2 rounded-full bg-white/10"></div>
                    <div className="mt-auto flex gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      <Mail className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Multi-Channel Ready</h3>
                <p className="text-zinc-400">One idea, infinite formats. Turn a blog post into a thread, a LinkedIn update, and a newsletter instantly.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative group hover:bg-white/10 transition-colors">
              <RefreshCw className="w-8 h-8 text-blue-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Infinite Variations</h3>
              <p className="text-zinc-400">Not happy? Click once to rewrite. Generate 10 variations in the time it takes to write one.</p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative group hover:bg-white/10 transition-colors">
              <Shield className="w-8 h-8 text-green-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Private & Secure</h3>
              <p className="text-zinc-400">Your voice data is siloed. We never train public models on your private brand guidelines.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">From Chaos to Clarity</h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent hidden md:block"></div>

            {[
              { icon: PenTool, title: "1. Define", desc: "Set your tone (e.g., 'Witty', 'Professional') and guidelines." },
              { icon: Cpu, title: "2. Input", desc: "Paste rough notes, an old blog, or a messy draft." },
              { icon: Zap, title: "3. Generate", desc: "Get polished content that sounds 100% like you." }
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-[#030712] border-4 border-purple-500/10 flex items-center justify-center mb-6 z-10 relative">
                  <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-xl"></div>
                  <step.icon className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-zinc-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 relative overflow-hidden" id="pricing">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-zinc-400">Start with our famous 7-day trial. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 flex flex-col">
              <h3 className="text-xl font-medium text-zinc-300 mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-6">$0</div>
              <p className="text-zinc-400 mb-8 border-b border-white/5 pb-8">Perfect for hobbyists exploring their voice.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-zinc-600" /> <span className="text-zinc-300">1 Brand Voice</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-zinc-600" /> <span className="text-zinc-300">50 Rewrites / mo</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-zinc-600" /> <span className="text-zinc-300">Standard Support</span></li>
              </ul>
              <Link href="/auth">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/10">Get Started Free</Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="rounded-3xl border border-purple-500/30 bg-purple-500/5 p-10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
              <h3 className="text-xl font-medium text-white mb-2">Pro Creator</h3>
              <div className="text-4xl font-bold mb-6">{proPrice}<span className="text-lg font-normal text-zinc-500">/mo</span></div>
              <p className="text-zinc-300 mb-8 border-b border-white/5 pb-8">For serious creators and agencies.</p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> <span className="text-white">Unlimited Brand Voices</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> <span className="text-white">Unlimited Rewrites</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> <span className="text-white">Latest Gemini 2.5 Logic</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-purple-400" /> <span className="text-white">Priority 7-Day Trial</span></li>
              </ul>
              <Link href="/auth">
                <Button className="w-full bg-white text-black hover:bg-gray-200">Start 7-Day Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 text-center border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500">Ready to find your voice?</h2>
          <Link href="/auth">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-zinc-200 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
              Join BrandVoice Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-zinc-500">No credit card required for free tier.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-sm">
        <div className="flex justify-center gap-6 mb-8">
          <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
        </div>
        <p>&copy; 2024 BrandVoice AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
