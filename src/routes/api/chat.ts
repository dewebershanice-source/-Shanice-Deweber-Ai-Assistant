import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

type Body = { messages?: unknown; threadId?: string };

const MAX_MESSAGES = 100;
const MAX_PART_CHARS = 10_000;
const MAX_TOTAL_CHARS = 200_000;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);
        if (!token) return new Response("Unauthorized", { status: 401 });

        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server misconfigured", { status: 500 });
        }

        // Validate JWT BEFORE invoking the AI model.
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_PUBLISHABLE_KEY,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
          },
        );
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        const userId = claimsData?.claims?.sub;
        if (claimsError || !userId) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        if (messages.length === 0 || messages.length > MAX_MESSAGES) {
          return new Response(`Message count must be 1-${MAX_MESSAGES}`, { status: 400 });
        }

        // Validate message shape and length caps.
        let totalChars = 0;
        for (const m of messages as UIMessage[]) {
          if (!m || typeof m !== "object" || typeof m.role !== "string" || !Array.isArray(m.parts)) {
            return new Response("Invalid message format", { status: 400 });
          }
          for (const p of m.parts) {
            if (p && p.type === "text" && typeof p.text === "string") {
              if (p.text.length > MAX_PART_CHARS) {
                return new Response("Message part too long", { status: 400 });
              }
              totalChars += p.text.length;
              if (totalChars > MAX_TOTAL_CHARS) {
                return new Response("Payload too large", { status: 400 });
              }
            }
          }
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onFinish: async ({ messages: finalMessages }) => {
            if (!threadId) return;
            try {
              // Persist any new messages (last user msg + assistant reply)
              const toPersist = finalMessages.slice(-2);
              for (const m of toPersist) {
                await supabase.from("chat_messages").insert({
                  thread_id: threadId,
                  user_id: userId,
                  role: m.role,
                  message: m as unknown as Record<string, unknown>,
                });
              }
              // Touch thread updated_at + auto-title if "New conversation"
              const { data: thread } = await supabase
                .from("chat_threads")
                .select("title")
                .eq("id", threadId)
                .single();
              const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
              if (thread && (thread.title === "New conversation" || !thread.title)) {
                const firstUser = (messages as UIMessage[]).find((m) => m.role === "user");
                const firstText = firstUser?.parts
                  ?.map((p) => (p.type === "text" ? p.text : ""))
                  .join(" ")
                  .slice(0, 60);
                if (firstText) updates.title = firstText;
              }
              await supabase.from("chat_threads").update(updates).eq("id", threadId);
            } catch (e) {
              console.error("[chat] persist failed", e);
            }
          },
        });
      },
    },
  },
});
