import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrandVoices } from "@/hooks/use-brand-voices";
import { useCreateRewrite } from "@/hooks/use-rewrites";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Copy, Check, ArrowRight, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
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
      toast({ title: "Success!", description: "Text rewritten successfully." });
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

        {/* Controls */}
        <div className="flex flex-col gap-4 p-4 bg-card rounded-xl border shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-1 min-w-[280px]">
              <div className="w-full max-w-xs space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">SELECT VOICE</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger className="w-full border-input/50 bg-background/50">
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

              <div className="w-full max-w-xs space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">PLATFORM</Label>
                <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                  <SelectTrigger className="w-full border-input/50 bg-background/50">
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
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 min-w-[160px]"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {mode === 'enhance' ? 'Enhancing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> {mode === 'enhance' ? 'Enhance Text' : 'Generate Post'}
                </>
              )}
            </Button>
          </div>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "enhance" | "generate")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="enhance">Refine Draft</TabsTrigger>
              <TabsTrigger value="generate">Create New</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Editor Area */}
        <div className="grid lg:grid-cols-2 gap-6 h-[500px]">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-semibold text-muted-foreground">
              {mode === 'enhance' ? 'ORIGINAL DRAFT' : 'TOPIC / IDEA'}
            </Label>
            <Textarea
              className="flex-1 p-6 text-base leading-relaxed resize-none rounded-2xl border-border/50 bg-white/50 focus:bg-white transition-all shadow-sm focus:shadow-md focus:ring-primary/20"
              placeholder={mode === 'enhance' ? "Paste your draft text here..." : "Describe what you want to write about (e.g., 'The future of AI in 2025')"}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-primary">REWRITTEN RESULT</Label>
              <div className="flex items-center gap-2">
                {rewrittenText && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFeedbackType("positive");
                        setFeedbackOpen(true);
                      }}
                      className="h-8 text-xs text-muted-foreground hover:text-green-600 hover:bg-green-50"
                    >
                      <ThumbsUp className="mr-1 h-3 w-3" />
                      Good Result?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFeedbackType("negative");
                        setFeedbackOpen(true);
                      }}
                      className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <ThumbsDown className="mr-1 h-3 w-3" />
                      Bad Result?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
                    >
                      {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                      {copied ? "Copied" : "Copy Text"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 relative rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-inner">
              {rewrittenText ? (
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-wrap animate-in fade-in duration-500">
                  {rewrittenText}
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40">
                  <ArrowRight className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Result will appear here</p>
                </div>
              )}
            </div>
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
