import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
  Users,
  Lightbulb,
} from "lucide-react";

export default function Landing() {
  const { data: products } = useQuery<any>({
    queryKey: ['/api/products'],
  });

  const proPrice = products?.[0]?.unit_amount
    ? `$${(products[0].unit_amount / 100).toFixed(2)}`
    : "$4.90";

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-display text-xl font-bold">BrandVoice AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            Powered by Gemini 2.5 Flash
          </div>

          {/* Main Heading */}
          <h1 className="mx-auto max-w-5xl font-display text-5xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground/60">
              Your Brand's Voice,
            </span>
            <span className="block text-primary mt-2">
              Perfectly Consistent
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto max-w-3xl text-lg lg:text-xl leading-8 text-muted-foreground mb-6">
            Stop struggling with tone inconsistency. Train AI on your brand's unique voice, then rewrite any content to sound exactly like you in seconds. Used by marketing teams, agencies, and creators.
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                Join 500+ teams
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                95% faster content approval
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                Start for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-background/80"
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - Core Features */}
      <section id="features" className="py-20 lg:py-32 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to maintain consistent brand voice at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered Rewrites"
              description="Transform generic drafts into on-brand copy instantly using advanced Gemini AI. No training required."
            />
            <FeatureCard
              icon={Shield}
              title="Voice Training"
              description="Define your brand's guidelines, tone tags, and personality. AI learns and applies your unique voice."
            />
            <FeatureCard
              icon={RefreshCw}
              title="Unlimited Rewrites"
              description="Generate as many variations as needed. Fine-tune until your message is perfect."
            />
            <FeatureCard
              icon={Layers}
              title="Multiple Voices"
              description="Create different brand voices for various audiences, products, or campaigns."
            />
            <FeatureCard
              icon={Globe}
              title="Multi-Platform"
              description="Optimized outputs for email, social media, blogs, ads, and all marketing channels."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="Consistency at Scale"
              description="Ensure every team member writes with the same voice, maintaining brand integrity."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to brand-consistent content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Create Your Voice",
                description:
                  "Define your brand's guidelines, tone preferences, and key characteristics. Takes just 2 minutes.",
                icon: Lightbulb,
              },
              {
                step: "2",
                title: "Input Your Content",
                description:
                  "Paste any text you want to rewrite. A blog post, email, social media copy, anything.",
                icon: Cpu,
              },
              {
                step: "3",
                title: "Get AI Rewrites",
                description:
                  "Receive perfectly on-brand variations instantly. Pick your favorite or regenerate.",
                icon: Zap,
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex flex-col h-full rounded-2xl border bg-card p-8 shadow-sm">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-display font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 mt-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 lg:py-32 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Perfect For Any Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Marketing teams, agencies, creators, and enterprises all trust BrandVoice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Marketing Teams",
                description: "Maintain consistency across campaigns and channels",
                icon: Users,
              },
              {
                title: "Agencies",
                description: "Deliver on-brand content to multiple clients faster",
                icon: Globe,
              },
              {
                title: "Content Creators",
                description: "Build a recognizable personal brand voice",
                icon: Sparkles,
              },
              {
                title: "Enterprises",
                description: "Scale brand guidelines across your entire organization",
                icon: Shield,
              },
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
              >
                <useCase.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="font-display font-bold text-lg mb-2">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-32 bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-8">
                Why Teams Love BrandVoice
              </h2>

              <div className="space-y-6">
                {[
                  "Save 10+ hours weekly on content revisions",
                  "Reduce approval cycles by 75%",
                  "Eliminate brand voice inconsistencies",
                  "Empower team members with AI assistance",
                  "Scale content production without hiring",
                  "Maintain brand integrity across all channels",
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <span className="text-lg text-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/auth" className="mt-10 inline-block">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Right side - Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-2xl" />
              <div className="relative bg-card border rounded-2xl p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="h-3 bg-muted rounded-full w-3/4" />
                  <div className="h-3 bg-muted rounded-full w-full" />
                  <div className="h-3 bg-muted rounded-full w-5/6" />
                  <div className="pt-4 border-t">
                    <div className="h-3 bg-primary/20 rounded-full w-1/2 mt-4" />
                    <div className="h-3 bg-primary/20 rounded-full w-2/3 mt-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-32 border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free. Upgrade when you're ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border bg-card p-8 shadow-sm">
              <h3 className="font-display text-2xl font-bold mb-2">Free</h3>
              <p className="text-muted-foreground mb-6">Perfect to get started</p>
              <div className="text-4xl font-bold mb-8">
                $0<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <Link href="/auth">
                <Button
                  variant="outline"
                  className="w-full mb-8"
                  data-testid="button-pricing-free"
                >
                  Get Started
                </Button>
              </Link>
              <div className="space-y-3">
                {[
                  "1 brand voice",
                  "100 rewrites/month",
                  "Basic voice training",
                  "Community support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 shadow-lg relative">
              <div className="absolute -top-4 left-8 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground mb-6">For growing teams</p>

              <div className="text-4xl font-bold mb-8">
                {proPrice}<span className="text-lg text-muted-foreground">/mo</span>
              </div>
              <div className="mb-4 text-sm font-medium text-primary">
                Includes 7-day free trial
              </div>
              <Link href="/auth">
                <Button
                  className="w-full mb-8 bg-primary hover:bg-primary/90"
                  data-testid="button-pricing-pro"
                >
                  Start 7-Day Free Trial
                </Button>
              </Link>
              <div className="space-y-3">
                {[
                  "Unlimited brand voices",
                  "Unlimited rewrites",
                  "Advanced analytics",
                  "Team collaboration",
                  "Priority support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 border-t overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
        </div>

        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight mb-6">
            Ready to Perfect Your Brand Voice?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of teams maintaining consistent brand communication. Start free, no credit card required.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="h-12 px-10 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              data-testid="button-cta-final"
            >
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-display font-bold">BrandVoice AI</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-muted-foreground">
              <p>© 2024 BrandVoice AI. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative rounded-2xl border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 font-display text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
