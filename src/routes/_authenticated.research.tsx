import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import { AiOutput } from "@/components/AiOutput";
import { researchWorkplace } from "@/lib/ai.functions";
import { BookOpen, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({ meta: [{ title: "Workplace Research Assistant — UbuntuAI" }] }),
  component: ResearchPage,
});

const SUGGESTIONS = [
  "How much annual leave is an employee entitled to under the BCEA?",
  "What is the standard notice period for a permanent employee?",
  "How is overtime calculated in South Africa?",
  "What steps must a fair disciplinary procedure follow?",
  "What records must an employer keep for staff?",
];

function ResearchPage() {
  const run = useServerFn(researchWorkplace);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function ask(q?: string) {
    const text = (q ?? question).trim();
    if (text.length < 5) return toast.error("Please enter a longer question");
    setQuestion(text);
    setLoading(true);
    setOutput(null);
    try {
      const res = await run({ data: { question: text } });
      setOutput(res.text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="SA Workplace Research Assistant"
        description="Plain-English answers on leave, notice, overtime, procedures & more."
        icon={<BookOpen className="h-5 w-5" />}
      />
      <AiNotice compact />

      <Card className="bg-gradient-card shadow-card">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label>Your question</Label>
            <Textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does sick leave accrue in the first 6 months of employment?"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
          <Button onClick={() => ask()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Research
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card className="grid place-items-center bg-gradient-card p-10 shadow-card">
          <div className="text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
            Researching SA workplace context…
          </div>
        </Card>
      )}
      {!loading && output && <AiOutput markdown={output} filename="ubuntuai-research.md" />}
    </div>
  );
}
