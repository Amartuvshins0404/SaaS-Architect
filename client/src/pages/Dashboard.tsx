import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrandVoices } from "@/hooks/use-brand-voices";
import { useCreateRewrite } from "@/hooks/use-rewrites";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, ArrowRight, Loader2, ThumbsDown, ThumbsUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { SEO } from "@/components/seo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { data: voices, isLoading: loadingVoices } = useBrandVoices();
  const { mutateAsync: createRewrite, isPending: generating } = useCreateRewrite();
  const { mutateAsync: submitFeedback, isPending: submittingFeedback } = useSubmitFeedback();
  const { toast } = useToast();

  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [originalText, setOriginalText] = useState("");
  const [rewrittenText, setRewrittenText] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastRewriteId, setLastRewriteId] = useState<number | undefined>(undefined);

  // Feedback State
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative">("negative");
  const [feedbackText, setFeedbackText] = useState("");

  const [mode, setMode] = useState<"enhance" | "generate">("enhance");
  const [platform, setPlatform] = useState<"twitter" | "linkedin" | "general">("twitter");

  const handleRewrite = async () => {
    if (!selectedVoice) {
      toast({ variant: "destructive", title: "Select a voice", description: "Please select a brand voice first." });
      return;
    }
    if (!originalText.trim()) {
      toast({ variant: "destructive", title: "Empty text", description: "Please enter some text to rewrite." });
      return;
    }

    try {
      const result = await createRewrite({
        brandVoiceId: parseInt(selectedVoice),
        originalText,
        mode,
        platform
      });
      setRewrittenText(result.rewrittenText);
      setLastRewriteId(result.id);
      toast({ title: "Success!", description: "Text generated successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Text copied to clipboard." });
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;

    try {
      await submitFeedback({
        feedback: feedbackText,
        rewriteId: lastRewriteId,
        isPositive: feedbackType === "positive"
      });

      setFeedbackOpen(false);
      setFeedbackText("");
      toast({
        title: "Feedback Received",
        description: feedbackType === "positive"
          ? "Great! We'll remember what you liked."
          : "We apologize. We are improving our system based on your feedback."
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit feedback" });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <SEO
          title="Dashboard"
          description="Write faster with your custom AI Brand Voice. Generate threads, posts, and captions that sound 100% like you."
        />
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Transform your content using your custom brand voices.</p>
        </header>

        {/* Mode Toggles */}
        <Tabs defaultValue="enhance" value={mode} onValueChange={(v) => setMode(v as any)} className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhance">Enhance Draft</TabsTrigger>
            <TabsTrigger value="generate">Generate Ideas</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
            <div className="flex flex-col gap-1.5 w-full max-w-[300px]">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Brand Voice</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-full bg-background border-input/40 h-10">
                  <SelectValue placeholder={loadingVoices ? "Loading..." : "Select a Brand Voice"} />
                </SelectTrigger>
                <SelectContent>
                  {voices?.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id.toString()}>
                      {voice.name}
                    </SelectItem>
                  ))}
                  {voices?.length === 0 && (
                    <div className="p-2">
                      <Link href="/app/voices">
                        <Button variant="link" size="sm" className="w-full">Create a voice first</Button>
                      </Link>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="hidden md:flex flex-col gap-1.5 w-[200px]">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</Label>
              <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                <SelectTrigger className="w-full bg-background border-input/40 h-10">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="general">General / Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleRewrite}
            disabled={generating || !selectedVoice || !originalText}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 min-w-[180px] h-11 text-base font-semibold transition-all hover:scale-105 active:scale-95"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
              </>
            ) : mode === "generate" ? (
              <>
                <Lightbulb className="mr-2 h-5 w-5 fill-current" /> Generate Ideas
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5 fill-current" /> Generate Rewrite
              </>
            )}
          </Button>
        </div>

        {/* Main Editor Split View */}
        <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          {/* Left: Input Pane */}
          <div className="flex flex-col rounded-2xl border border-border bg-card/30 overflow-hidden relative group transition-all hover:border-primary/20">
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/20">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 group-hover:bg-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground">
                  {mode === "generate" ? "Topic / Context" : "Original Text"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOriginalText('')}
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
              >
                Clear
              </Button>
            </div>

            <Textarea
              className="flex-1 p-6 text-base leading-relaxed resize-none border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/30 font-mono"
              placeholder={mode === "generate"
                ? "Enter a topic (e.g. 'Future of SaaS', 'Remote Work Tips') and we'll generate on-brand ideas..."
                : "Paste your AI-generated draft here (e.g. from ChatGPT, Claude, etc)..."}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
            />

            <div className="p-3 border-t border-border/50 bg-card/20 flex justify-between items-center text-xs text-muted-foreground">
              <span>{originalText.length} chars</span>
              {/* Future: Add 'Paste' button here */}
            </div>
          </div>

          {/* Right: Output Pane (Premium Glass Style) */}
          <div className="flex flex-col rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden shadow-2xl shadow-primary/5 relative">
            <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Rewritten Output</span>
              </div>
              <div className="flex items-center gap-1">
                {rewrittenText && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {rewrittenText ? (
                <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-gray-300">
                  <div className="whitespace-pre-wrap font-sans text-base md:text-lg text-foreground/90">
                    {rewrittenText}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary/20" />
                  </div>
                  <p className="text-sm">Ready to transform your content</p>
                </div>
              )}
            </div>

            {/* Feedback Footer */}
            {rewrittenText && (
              <div className="p-3 border-t border-primary/10 bg-primary/5 flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{rewrittenText.length} chars</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFeedbackType("positive");
                      setFeedbackOpen(true);
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
                  >
                    <ThumbsUp className="mr-1.5 h-3 w-3" /> Helpful
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFeedbackType("negative");
                      setFeedbackOpen(true);
                    }}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                  >
                    <ThumbsDown className="mr-1.5 h-3 w-3" /> Poor
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackType === "positive" ? "What did you like?" : "Report an Issue"}</DialogTitle>
            <DialogDescription>
              {feedbackType === "positive"
                ? "Help us understand what worked well so we can do it more often."
                : "Help us improve. What was wrong with this result? Be specific."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={feedbackType === "positive"
                ? "E.g. The tone was perfect, I liked the emoji usage..."
                : "E.g. Too formal, used wrong emojis, didn't follow length constraints..."}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
            <Button onClick={handleFeedbackSubmit} disabled={submittingFeedback || !feedbackText.trim()}>
              {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
