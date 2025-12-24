import { AppLayout } from "@/components/layout/AppLayout";
import { useRewrites } from "@/hooks/use-rewrites";
import { useBrandVoices } from "@/hooks/use-brand-voices";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { data: rewrites, isLoading: loadingRewrites } = useRewrites();
  const { data: voices } = useBrandVoices();

  const getVoiceName = (id?: number | null) => {
    if (!id || !voices) return "Unknown Voice";
    return voices.find(v => v.id === id)?.name || "Unknown Voice";
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">History</h1>
          <p className="text-muted-foreground">View your past rewrites and generations.</p>
        </header>

        {loadingRewrites ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
          </div>
        ) : rewrites?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No history yet. Start generating content on the Dashboard!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rewrites?.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {getVoiceName(item.brandVoiceId)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.createdAt ? format(new Date(item.createdAt), 'PPP p') : 'Just now'}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
                    <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                      {item.originalText}
                    </div>
                    
                    <div className="hidden md:flex items-center justify-center h-full">
                       <ArrowRight className="text-muted-foreground/30" />
                    </div>

                    <div className="bg-primary/5 p-4 rounded-lg text-sm text-foreground font-medium border border-primary/10">
                      {item.rewrittenText}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
