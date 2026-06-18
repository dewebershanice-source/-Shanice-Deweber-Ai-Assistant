import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import { AiOutput } from "@/components/AiOutput";
import { summarizeMeeting } from "@/lib/ai.functions";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/meetings")({
  head: () => ({ meta: [{ title: "Meeting Minutes & Action Tracker — UbuntuAI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOutput(null);
    try {
      const { text } = await run({ data: { meetingTitle: title || undefined, notes } });
      setOutput(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarise");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Meeting Minutes & Action Tracker"
        description="Paste raw notes or a transcript — get structured minutes."
        icon={<FileText className="h-5 w-5" />}
      />
      <AiNotice compact />

      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Meeting title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Weekly Ops Sync — 18 June 2026" />
            </div>
            <div className="space-y-1.5">
              <Label>Meeting notes / transcript</Label>
              <Textarea
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your raw meeting notes or transcript here…"
                required
                minLength={20}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Generate minutes
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <Card className="grid place-items-center bg-gradient-card p-10 shadow-card">
          <div className="text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
            Extracting decisions and action items…
          </div>
        </Card>
      )}
      {!loading && output && <AiOutput markdown={output} filename="ubuntuai-meeting-minutes.md" />}
    </div>
  );
}
