    import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Star, Share2, Copy, MessageSquare, Lock, Globe, Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useBrandVoices } from "@/hooks/use-brand-voices";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useCreateRewrite } from "@/hooks/use-rewrites";

type PublicVoice = {
    id: number;
    name: string;
    guidelines: string;
    toneTags: string[] | null;
    authorName: string | null;
    voteCount: number;
    reviewCount: number;
    rating: number;
    hasVoted: number;
    createdAt: string;
};

export default function Community() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [location, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<"popular" | "newest">("popular");

    // Dialog States
    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [tryingVoice, setTryingVoice] = useState<PublicVoice | null>(null);
    const [viewingVoice, setViewingVoice] = useState<PublicVoice | null>(null);

    // Queries
    const { data: voices, isLoading } = useQuery<PublicVoice[]>({
        queryKey: ["community-voices", activeTab],
        queryFn: async () => {
            const res = await fetch(api.community.list.path + `?sort=${activeTab}&limit=50`);
            if (!res.ok) throw new Error("Failed to fetch voices");
            return res.json();
        }
    });

    const { data: myVoices } = useBrandVoices();

    // Mutations
    const voteMutation = useMutation({
        mutationFn: async ({ id, type }: { id: number; type: number }) => {
            const res = await fetch(api.community.vote.path.replace(":id", String(id)), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voteType: type })
            });
            if (!res.ok) throw new Error("Vote failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["community-voices"] });
        }
    });

    const cloneMutation = useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(api.community.clone.path.replace(":id", String(id)), {
                method: "POST",
            });
            if (!res.ok) throw new Error("Clone failed");
        },
        onSuccess: () => {
            toast({ title: "Voice Cloned", description: "Added to your library!" });
        }
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, content, rating }: { id: number; content: string; rating: number }) => {
            const res = await fetch(api.community.review.path.replace(":id", String(id)), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, rating })
            });
            if (!res.ok) throw new Error("Review failed");
        },
        onSuccess: () => {
            toast({ title: "Review Submitted" });
            queryClient.invalidateQueries({ queryKey: ["community-voices"] });
        }
    });

    const togglePublicMutation = useMutation({
        mutationFn: async ({ id, isPublic }: { id: number; isPublic: boolean }) => {
            const res = await fetch(api.community.publish.path.replace(":id", String(id)), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPublic })
            });
            if (!res.ok) throw new Error("Failed to update visibility");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.brandVoices.list.path] });
            queryClient.invalidateQueries({ queryKey: ["community-voices"] });
            toast({ title: "Visibility Updated" });
        }
    });


    const handleShareClick = () => {
        if (user?.subscriptionTier !== "pro") {
            setIsPaywallOpen(true);
        } else {
            setIsManageOpen(true);
        }
    };

    const handleUpgrade = () => {
        setLocation("/app/settings");
    };

    return (
        <AppLayout>
            <div className="container mx-auto py-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Community Voices</h1>
                        <p className="text-muted-foreground mt-2">Discover and adopt brand voices created by the community.</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2 bg-muted p-1 rounded-lg h-fit">
                            <Button variant={activeTab === "popular" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("popular")}>Popular</Button>
                            <Button variant={activeTab === "newest" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("newest")}>Newest</Button>
                        </div>

                        <Button onClick={handleShareClick} className="gap-2 shadow-lg shadow-primary/20">
                            <Share2 className="w-4 h-4" /> Share Your Voice
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
                    </div>
                ) : voices?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-primary/20 rounded-xl bg-card/30">
                        <Globe className="w-10 h-10 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium">No community voices yet</h3>
                        <p className="text-muted-foreground mb-4">Be the first to share your voice!</p>
                        <Button onClick={handleShareClick}>Share Now</Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {voices?.map((voice) => (
                            <VoiceCard
                                key={voice.id}
                                voice={voice}
                                onVote={(type) => voteMutation.mutate({ id: voice.id, type })}
                                onClone={() => cloneMutation.mutate(voice.id)}
                                onReview={(content, rating) => reviewMutation.mutate({ id: voice.id, content, rating })}
                                onTry={() => setTryingVoice(voice)}
                                onClick={() => setViewingVoice(voice)}
                            />
                        ))}
                    </div>
                )}

                {/* Manage Dialog (Pro only) */}
                <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Manage Public Voices</DialogTitle>
                            <DialogDescription>
                                Toggle which of your voices are visible to the community.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                            {myVoices?.map(voice => (
                                <div key={voice.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                                    <div>
                                        <h4 className="font-medium">{voice.name}</h4>
                                        <div className="flex gap-2 mt-1">
                                            {voice.isPublic && <Badge variant="secondary" className="text-[10px] bg-green-500/10 text-green-500">Public</Badge>}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`public-${voice.id}`}
                                            checked={voice.isPublic}
                                            onCheckedChange={(checked) => togglePublicMutation.mutate({ id: voice.id, isPublic: checked })}
                                        />
                                        <Label htmlFor={`public-${voice.id}`}>{voice.isPublic ? "Public" : "Private"}</Label>
                                    </div>
                                </div>
                            ))}
                            {myVoices?.length === 0 && <p className="text-center text-muted-foreground">You have no voices to share.</p>}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Paywall Dialog */}
                <Dialog open={isPaywallOpen} onOpenChange={setIsPaywallOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary" />
                                Unlock Community Sharing
                            </DialogTitle>
                            <DialogDescription>
                                Sharing your voices with the community is a Pro feature. Upgrade now to showcase your prompt engineering skills!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <div className="bg-primary/5 p-4 rounded-lg flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">PRO</div>
                                <div>
                                    <p className="font-bold text-foreground">Pro Plan</p>
                                    <p className="text-xs text-muted-foreground">Includes unlimited sharing, cloning, and priority support.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsPaywallOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpgrade} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">Upgrade to Pro</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Voice Details Dialog */}
                <VoiceDetailsDialog
                    isOpen={!!viewingVoice}
                    onClose={() => setViewingVoice(null)}
                    voice={viewingVoice}
                />

                {/* Try Voice Dialog */}
                <TryVoiceDialog
                    isOpen={!!tryingVoice}
                    onClose={() => setTryingVoice(null)}
                    voice={tryingVoice}
                />
            </div>
        </AppLayout>
    );
}

function VoiceDetailsDialog({ isOpen, onClose, voice }: { isOpen: boolean, onClose: () => void, voice: PublicVoice | null }) {
    if (!voice) return null;
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex justify-between items-start mr-6">
                        <div>
                            <DialogTitle className="text-xl">{voice.name}</DialogTitle>
                            <DialogDescription>by {voice.authorName || "Anonymous"}</DialogDescription>
                        </div>
                        <Badge variant="outline" className="flex gap-1 items-center">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {voice.rating.toFixed(1)}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Tones</Label>
                        <div className="flex flex-wrap gap-2">
                            {voice.toneTags?.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Guidelines & Prompt</Label>
                        <div className="p-4 bg-muted/30 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {voice.guidelines}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {voice.voteCount} votes</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {voice.reviewCount} reviews</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TryVoiceDialog({ isOpen, onClose, voice }: { isOpen: boolean, onClose: () => void, voice: PublicVoice | null }) {
    const [text, setText] = useState("");
    const [result, setResult] = useState("");

    // We import the hook at the top level of the file, so it's fine to use here
    const { mutateAsync: generate, isPending } = useCreateRewrite();

    const handleTry = async () => {
        if (!voice || !text) return;
        try {
            const res = await generate({
                brandVoiceId: voice.id,
                originalText: text,
                mode: "enhance",
                platform: "twitter"
            });
            setResult(res.rewrittenText);
        } catch (e) {
            // Error handled by hook or global
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Try Voice: {voice?.name}</DialogTitle>
                    <DialogDescription>
                        See how this voice transforms your text. (Temporary session)
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Original Text</Label>
                        <Textarea
                            placeholder="Enter text to rewrite..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="h-24"
                        />
                    </div>

                    {result && (
                        <div className="space-y-2">
                            <Label className="text-primary flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> Result
                            </Label>
                            <div className="p-3 bg-muted/50 rounded-lg text-sm border border-primary/10">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Close</Button>
                    <Button onClick={handleTry} disabled={!text || isPending} className="gap-2">
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function VoiceCard({ voice, onVote, onClone, onReview, onTry, onClick }: {
    voice: PublicVoice,
    onVote: (t: number) => void,
    onClone: () => void,
    onReview: (c: string, r: number) => void,
    onTry: () => void,
    onClick: () => void
}) {
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);

    return (
        <Card className="flex flex-col h-full bg-card hover:border-primary/50 transition-colors cursor-pointer group" onClick={onClick}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="truncate group-hover:text-primary transition-colors">{voice.name}</CardTitle>
                    <Badge variant="outline" className="flex gap-1 items-center">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {voice.rating.toFixed(1)} ({voice.reviewCount})
                    </Badge>
                </div>
                <CardDescription>by {voice.authorName || "Anonymous"}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="flex flex-wrap gap-2">
                    {voice.toneTags?.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                    "{voice.guidelines}"
                </p>
                <p className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">Click to view details</p>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between items-center text-sm text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${voice.hasVoted === 1 ? 'text-green-500' : ''}`} onClick={() => onVote(1)}>
                        <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="font-medium text-foreground">{voice.voteCount}</span>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 ${voice.hasVoted === -1 ? 'text-red-500' : ''}`} onClick={() => onVote(-1)}>
                        <ThumbsDown className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={onTry}>
                        <Sparkles className="w-4 h-4" />
                        Try
                    </Button>

                    <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MessageSquare className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Review {voice.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button key={star} onClick={() => setRating(star)}>
                                            <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    placeholder="What do you think about this voice?"
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                />
                                <Button onClick={() => {
                                    onReview(reviewText, rating);
                                    setIsReviewOpen(false);
                                    setReviewText("");
                                }} className="w-full">Submit Review</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm" className="gap-2" onClick={onClone}>
                        <Copy className="w-4 h-4" />
                        Clone
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
