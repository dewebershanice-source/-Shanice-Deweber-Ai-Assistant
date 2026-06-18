import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Square, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
});

const SUGGESTIONS = [
  "Draft a polite leave-rejection email",
  "Summarise the BCEA leave entitlements",
  "Plan my week — 5 tasks, mixed priorities",
  "What is a fair disciplinary procedure?",
];

function ChatThread() {
  const { threadId } = Route.useParams();
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token ?? null);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("message")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error(error.message);
        setInitialMessages([]);
        return;
      }
      setInitialMessages((data ?? []).map((r) => r.message as unknown as UIMessage));
    })();
  }, [threadId]);

  if (initialMessages === null || token === null) {
    return (
      <div className="grid flex-1 place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ChatInner key={threadId} threadId={threadId} initialMessages={initialMessages} token={token} />
  );
}

function ChatInner({
  threadId, initialMessages, token,
}: { threadId: string; initialMessages: UIMessage[]; token: string }) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: { Authorization: `Bearer ${token}` },
        body: { threadId },
      }),
    [threadId, token],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message),
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => { inputRef.current?.focus(); }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-gold-foreground" />
        Responsible AI · Verify outputs · Don't share confidential data
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">Try one of these:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage({ text: s })}
                    className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="border-t bg-background/60 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border bg-background p-2 shadow-card focus-within:border-primary/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask UbuntuAI anything about your workplace…"
            rows={1}
            className="max-h-40 min-h-[2.25rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <Button type="button" size="icon" variant="ghost" onClick={stop} aria-label="Stop">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-card">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
        UA
      </div>
      <div className={cn(
        "prose prose-sm dark:prose-invert max-w-none flex-1 text-foreground",
        "prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground",
        "prose-strong:text-foreground prose-li:text-foreground",
      )}>
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
