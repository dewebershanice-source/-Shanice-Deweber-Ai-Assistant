import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, SYSTEM_PROMPT } from "@/lib/ai-gateway.server";

type Body = { messages?: unknown; threadId?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice(7);

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
              const { createClient } = await import("@supabase/supabase-js");
              const supabase = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_PUBLISHABLE_KEY!,
                {
                  global: { headers: { Authorization: `Bearer ${token}` } },
                  auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
                },
              );
              const { data: claims } = await supabase.auth.getClaims(token);
              const userId = claims?.claims?.sub;
              if (!userId) return;

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
