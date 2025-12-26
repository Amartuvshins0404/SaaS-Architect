import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBrandVoices, useCreateBrandVoice, useDeleteBrandVoice } from "@/hooks/use-brand-voices";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic2, Plus, Trash2, Loader2, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export default function Voices() {
  const { data: voices, isLoading } = useBrandVoices();
  const { mutateAsync: createVoice, isPending: creating } = useCreateBrandVoice();
  const { mutateAsync: deleteVoice, isPending: deleting } = useDeleteBrandVoice();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingVoice, setViewingVoice] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [guidelines, setGuidelines] = useState("");
  const [toneTags, setToneTags] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAiEnhance = async () => {
    if (!name && !guidelines && !toneTags) {
      toast({ variant: "destructive", title: "Input needed", description: "Please enter some details (Name, Tone, or Draft Guidelines) first." });
      return;
    }

    try {
      setIsGenerating(true);
      console.log("Fetching guidelines from:", api.ai.generateGuidelines.path);
      const res = await fetch(api.ai.generateGuidelines.path, {
        method: api.ai.generateGuidelines.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentText: guidelines || `Voice Name: ${name}`,
          toneKeywords: toneTags.split(",").map(t => t.trim()).filter(Boolean)
        })
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to generate guidelines");
        } else {
          const text = await res.text();
          if (res.status === 404) throw new Error("Endpoint not found (404). Server might differ from client.");
          if (res.status === 401) throw new Error("Session expired. Please refresh the page.");
          throw new Error(`Server Error (${res.status}): ${text.slice(0, 50)}...`);
        }
      }
      const data = await res.json();
      setGuidelines(data.guidelines);
      toast({ title: "Enhanced!", description: "Guidelines generated with AI." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to generate guidelines." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVoice({
        name,
        guidelines,
        toneTags: toneTags.split(",").map(t => t.trim()).filter(Boolean),
      });
      toast({ title: "Voice created", description: "Your new brand voice is ready." });
      setIsOpen(false);
      setName("");
      setGuidelines("");
      setToneTags("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this voice?")) {
      try {
        await deleteVoice(id);
        toast({ title: "Voice deleted" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message });
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Brand Voices</h1>
            <p className="text-muted-foreground">Manage your custom AI personalities and tone settings.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Create New Voice
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-[#0B0E14] border border-primary/20 shadow-2xl shadow-black/50 overflow-hidden">
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <DialogHeader>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">Create Brand Voice</DialogTitle>
                <DialogDescription className="text-muted-foreground/80">
                  Define how your brand should sound. The AI will follow these guidelines.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 mt-2">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/90">Voice Name</Label>
                  <Input
                    placeholder="e.g. Professional LinkedIn, Casual Twitter"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="bg-secondary/20 border-primary/20 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40 h-11 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/90">Tone Keywords (comma separated)</Label>
                  <Input
                    placeholder="e.g. witty, professional, concise, empathetic"
                    value={toneTags}
                    onChange={e => setToneTags(e.target.value)}
                    className="bg-secondary/20 border-primary/20 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40 h-11 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-foreground/90">Style Guidelines</Label>
                    <div
                      onClick={isGenerating ? undefined : handleAiEnhance}
                      className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${isGenerating ? 'text-muted-foreground cursor-wait' : 'text-primary hover:text-primary/80'}`}
                    >
                      {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {isGenerating ? "Enhancing..." : "Enhance with AI"}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Describe specific rules: 'Never use passive voice', 'Always start with a greeting', etc."
                    className="min-h-[140px] bg-secondary/20 border-primary/20 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40 resize-none leading-relaxed transition-all"
                    value={guidelines}
                    onChange={e => setGuidelines(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 w-fit px-8"
                  >
                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Voice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
          </div>
        ) : voices?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-primary/20 bg-card/50">
            <Mic2 className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
            <h3 className="font-semibold text-lg text-foreground">No voices yet</h3>
            <p className="text-muted-foreground mb-4">Create your first brand voice to get started.</p>
            <Button variant="outline" onClick={() => setIsOpen(true)} className="border-primary/20 hover:bg-primary/10 hover:text-primary">Create Voice</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voices?.map((voice) => (
              <Card
                key={voice.id}
                className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50 border-primary/20 bg-card/50 cursor-pointer"
                onClick={() => setViewingVoice(voice)}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mic2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-foreground transition-colors group-hover:text-primary">{voice.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Created recently</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(e, voice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {voice.toneTags?.map((tag, i) => (
                        <span key={i} className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground border border-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-lg bg-secondary/30 p-3 text-sm text-muted-foreground line-clamp-3 border border-transparent">
                      <FileText className="inline-block w-3 h-3 mr-1 mb-0.5 opacity-50" />
                      {voice.guidelines}
                    </div>
                    <p className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Click to view details</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!viewingVoice} onOpenChange={(open) => !open && setViewingVoice(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{viewingVoice?.name}</DialogTitle>
              <DialogDescription>Your custom brand voice</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Tones</Label>
                <div className="flex flex-wrap gap-2">
                  {viewingVoice?.toneTags?.map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Guidelines & Prompt</Label>
                <div className="p-4 bg-muted/30 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {viewingVoice?.guidelines}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
