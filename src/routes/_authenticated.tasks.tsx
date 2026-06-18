import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import { AiOutput } from "@/components/AiOutput";
import { planTasks } from "@/lib/ai.functions";
import { CalendarCheck, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Employee Task Planner — UbuntuAI" }] }),
  component: TasksPage,
});

type Task = { title: string; deadline?: string; priority?: "Low" | "Medium" | "High" };

function TasksPage() {
  const run = useServerFn(planTasks);
  const [hours, setHours] = useState("08:00 - 17:00, Mon-Fri");
  const [tasks, setTasks] = useState<Task[]>([{ title: "", deadline: "", priority: "Medium" }]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  function update(i: number, patch: Partial<Task>) {
    setTasks((arr) => arr.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  }
  function add() { setTasks((a) => [...a, { title: "", deadline: "", priority: "Medium" }]); }
  function remove(i: number) { setTasks((a) => (a.length === 1 ? a : a.filter((_, idx) => idx !== i))); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = tasks.filter((t) => t.title.trim().length > 0);
    if (cleaned.length === 0) return toast.error("Add at least one task");
    setLoading(true);
    setOutput(null);
    try {
      const { text } = await run({ data: { tasks: cleaned, workingHours: hours } });
      setOutput(text);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Employee Task Planner"
        description="Turn a task list into a daily and weekly plan."
        icon={<CalendarCheck className="h-5 w-5" />}
      />
      <AiNotice compact />

      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Working hours</Label>
              <Input value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Tasks</Label>
              {tasks.map((t, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 rounded-lg border bg-background p-3 sm:grid-cols-[1fr_160px_140px_auto]">
                  <Input
                    placeholder="Task title"
                    value={t.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                  />
                  <Input
                    placeholder="Deadline (e.g. Fri 12:00)"
                    value={t.deadline ?? ""}
                    onChange={(e) => update(i, { deadline: e.target.value })}
                  />
                  <Select value={t.priority ?? "Medium"} onValueChange={(v) => update(i, { priority: v as Task["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={add}>
                <Plus className="mr-1.5 h-4 w-4" /> Add task
              </Button>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Build plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <Card className="grid place-items-center bg-gradient-card p-10 shadow-card">
          <div className="text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-primary" />
            Building your schedule…
          </div>
        </Card>
      )}
      {!loading && output && <AiOutput markdown={output} filename="ubuntuai-task-plan.md" />}
    </div>
  );
}
