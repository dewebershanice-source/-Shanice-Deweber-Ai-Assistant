import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import { AiOutput } from "@/components/AiOutput";
import { generateEmail } from "@/lib/ai.functions";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — UbuntuAI" }] }),
  component: EmailPage,
});

const PURPOSES = [
  "Employee warning letter",
  "Leave approval",
  "Leave rejection",
  "Performance feedback",
  "Meeting invitation",
  "Client communication",
  "Internal announcement",
  "Custom",
];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [recipientType, setRecipientType] = useState("Employee");
  const [tone, setTone] = useState<"Formal" | "Informal" | "Persuasive">("Formal");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOutput(null);
    try {
      const { text } = await run({ data: { purpose, recipientType, tone, details } });
      setOutput(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Smart Email Generator"
        description="Draft professional workplace emails in seconds."
        icon={<Mail className="h-5 w-5" />}
      />
      <AiNotice compact />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email purpose</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PURPOSES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Recipient type</Label>
                  <Input value={recipientType} onChange={(e) => setRecipientType(e.target.value)} placeholder="e.g. Employee, Client, Team" />
                </div>
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Formal">Formal</SelectItem>
                      <SelectItem value="Informal">Informal</SelectItem>
                      <SelectItem value="Persuasive">Persuasive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Key details</Label>
                <Textarea
                  rows={8}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="What should the email say? Include names, dates, context, etc."
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate email
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="min-h-[300px]">
          {loading && (
            <Card className="grid h-full min-h-[300px] place-items-center bg-gradient-card shadow-card">
              <div className="text-center text-sm text-muted-foreground">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
                Drafting your email…
              </div>
            </Card>
          )}
          {!loading && output && <AiOutput markdown={output} filename="ubuntuai-email.md" />}
          {!loading && !output && (
            <Card className="grid h-full min-h-[300px] place-items-center bg-gradient-card shadow-card">
              <div className="text-center text-sm text-muted-foreground">
                <Mail className="mx-auto mb-2 h-8 w-8 opacity-40" />
                Your generated email will appear here.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
