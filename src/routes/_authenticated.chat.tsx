import { createFileRoute, useNavigate, Link, Outlet, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MessagesSquare, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "UbuntuAI Chatbot" }] }),
  component: ChatLayout,
});

type Thread = { id: string; title: string; updated_at: string };

function ChatLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const activeId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setThreads(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    // If no active thread and threads exist, navigate to most recent
    if (!loading && !activeId && threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id } });
    }
  }, [loading, activeId, threads, navigate]);

  async function createThread() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: user.id, title: "New conversation" })
      .select("id, title, updated_at")
      .single();
    if (error || !data) return toast.error(error?.message ?? "Failed");
    setThreads((t) => [data, ...t]);
    navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  }

  async function deleteThread(id: string) {
    const { error } = await supabase.from("chat_threads").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setThreads((t) => t.filter((x) => x.id !== id));
    if (activeId === id) {
      const next = threads.find((x) => x.id !== id);
      if (next) navigate({ to: "/chat/$threadId", params: { threadId: next.id } });
      else navigate({ to: "/chat" });
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-7xl gap-4">
      {/* Thread list */}
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border bg-gradient-card shadow-card md:flex">
        <div className="flex items-center justify-between border-b p-3">
          <p className="text-sm font-semibold">Conversations</p>
          <Button size="icon" variant="ghost" onClick={createThread} aria-label="New conversation">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {loading && (
              <div className="grid place-items-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && threads.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No conversations yet.
              </p>
            )}
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm transition",
                  activeId === t.id ? "bg-primary/10 text-foreground" : "hover:bg-muted text-muted-foreground",
                )}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="min-w-0 flex-1 truncate"
                >
                  {t.title || "New conversation"}
                </Link>
                <button
                  type="button"
                  onClick={() => deleteThread(t.id)}
                  className="rounded p-1 opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Active conversation */}
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border bg-gradient-card shadow-card">
        {!loading && !activeId && threads.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <MessagesSquare className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">UbuntuAI Chatbot</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Ask anything about SA workplace productivity, compliance, drafting documents, planning, or research.
              </p>
              <Button className="mt-5" onClick={createThread}>
                <Plus className="mr-1.5 h-4 w-4" /> Start a conversation
              </Button>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </section>
    </div>
  );
}
