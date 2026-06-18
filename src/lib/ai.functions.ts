import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, SYSTEM_PROMPT } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3-flash-preview";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function run(prompt: string) {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(MODEL),
    system: SYSTEM_PROMPT,
    prompt,
  });
  return { text };
}

/* ---------------- Email generator ---------------- */
const EmailInput = z.object({
  purpose: z.string().min(2).max(120),
  recipientType: z.string().min(2).max(80),
  tone: z.enum(["Formal", "Informal", "Persuasive"]),
  details: z.string().min(5).max(2000),
});

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Task: Draft a professional workplace email for a South African business context.

Email purpose: ${data.purpose}
Recipient type: ${data.recipientType}
Tone: ${data.tone}
Key details:
${data.details}

Output Format (use exactly these markdown headings):
## Subject
A single concise subject line.

## Email Body
The full professional email body, ready to send. Include a greeting and signature placeholder ([Your Name]).

## Closing Note
A short professional closing or call-to-action.`;
    return run(prompt);
  });

/* ---------------- Meeting minutes ---------------- */
const MeetingInput = z.object({
  notes: z.string().min(20).max(20000),
  meetingTitle: z.string().max(200).optional(),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Task: Analyse the following meeting notes/transcript and produce structured minutes.

${data.meetingTitle ? `Meeting: ${data.meetingTitle}\n` : ""}Raw notes:
"""
${data.notes}
"""

Output Format (use exactly these markdown headings):
## Meeting Summary
A 3-5 sentence executive summary.

## Key Discussion Points
- bullet points

## Decisions Made
- bullet points

## Action Items
A markdown table with columns: Action | Owner | Due Date | Priority.
Fill in unknowns as "TBD". Infer reasonable owners and due dates only when clearly stated in the notes.`;
    return run(prompt);
  });

/* ---------------- Task planner ---------------- */
const TaskInput = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        deadline: z.string().max(100).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
      }),
    )
    .min(1)
    .max(50),
  workingHours: z.string().max(100).optional(),
});

export const planTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const list = data.tasks
      .map(
        (t, i) =>
          `${i + 1}. ${t.title} — priority ${t.priority ?? "Medium"}, deadline ${t.deadline ?? "unspecified"}`,
      )
      .join("\n");
    const prompt = `Task: Build a productivity plan for a South African SME team member.

Working hours: ${data.workingHours ?? "08:00 - 17:00, Mon-Fri"}
Tasks:
${list}

Output Format (markdown):
## Daily Schedule (Today)
Time-blocked table: Time | Task | Notes.

## Weekly Plan
Bullet list grouped by day (Mon-Fri).

## Productivity Tips
3-5 short, practical tips tailored to South African workplace context (load-shedding resilience, focus blocks, batching, etc.).`;
    return run(prompt);
  });

/* ---------------- Research assistant ---------------- */
const ResearchInput = z.object({
  question: z.string().min(5).max(1000),
});

export const researchWorkplace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const prompt = `Task: Answer the following South African workplace question for an SME owner or HR officer.

Question: ${data.question}

Output Format (markdown):
## Executive Summary
2-3 sentences.

## Simplified Explanation
Plain-English explanation suitable for a non-lawyer.

## Key Insights
- bullet points with the most important facts (cite BCEA / LRA sections by name when relevant, without inventing section numbers).

## Recommendations
Practical next steps for the business.

## Disclaimer
Reminder that this is informational only and the user should consult a qualified labour-law or HR professional for binding advice.`;
    return run(prompt);
  });
