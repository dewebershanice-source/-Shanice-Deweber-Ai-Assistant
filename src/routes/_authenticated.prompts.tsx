import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import { Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/prompts")({
  head: () => ({ meta: [{ title: "Prompt Library — UbuntuAI" }] }),
  component: PromptsPage,
});

const PROMPTS = [
  {
    category: "HR",
    title: "Employee warning letter",
    body: `Role: You are an expert South African HR officer.
Task: Draft a written warning letter for an employee.
Context: Use BCEA-aligned tone; refer to fair-procedure principles.
Requirements: Include incident summary, prior verbal discussions, expected behaviour, consequences of recurrence.
Output Format: Subject line, formal letter body, signature block.`,
  },
  {
    category: "HR",
    title: "Leave approval response",
    body: `Role: You are a friendly office administrator.
Task: Write a leave approval email.
Context: South African SME; mention handover expectations.
Requirements: Confirm dates, contact during absence, return date.
Output Format: Subject + 3-paragraph email.`,
  },
  {
    category: "Operations",
    title: "Weekly team plan",
    body: `Role: You are a productivity coach for SA SMEs.
Task: Convert this task list into a weekly plan that survives load-shedding.
Context: Working hours 08:00–17:00, Mon–Fri.
Requirements: Time-blocks, owners, buffer time, focus periods.
Output Format: Markdown table per day + 3 tips.`,
  },
  {
    category: "Meetings",
    title: "Action-item extractor",
    body: `Role: You are an executive assistant.
Task: Extract action items from this meeting transcript.
Context: South African workplace; assume polite directness.
Requirements: Owner, due date, dependency, priority.
Output Format: Markdown table with columns Action | Owner | Due | Priority.`,
  },
  {
    category: "Compliance",
    title: "Policy explainer",
    body: `Role: You are a labour-law-aware explainer.
Task: Explain this policy to non-HR staff.
Context: South African legislation (BCEA / LRA).
Requirements: Simplify jargon; include 1 example.
Output Format: Summary, Key points, Example, Disclaimer.`,
  },
  {
    category: "Client",
    title: "Professional client follow-up",
    body: `Role: You are a senior account manager at a SA SME.
Task: Write a follow-up email after a client meeting.
Context: Maintain warmth + professionalism.
Requirements: Reference discussion points, list next steps, propose a date.
Output Format: Subject + email body + sign-off.`,
  },
];

function PromptsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Prompt Library"
        description="Ready-made prompts using the Role / Task / Context / Requirements / Output framework."
        icon={<Sparkles className="h-5 w-5" />}
      />
      <AiNotice compact />

      <div className="grid gap-4 md:grid-cols-2">
        {PROMPTS.map((p) => (
          <Card key={p.title} className="bg-gradient-card shadow-card">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {p.category}
                  </p>
                  <h3 className="truncate font-semibold text-foreground">{p.title}</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await navigator.clipboard.writeText(p.body);
                    toast.success("Prompt copied");
                  }}
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/50 p-3 text-xs text-foreground">
                {p.body}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
