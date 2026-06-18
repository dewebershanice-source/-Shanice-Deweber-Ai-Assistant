import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { AiNotice } from "@/components/AiNotice";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarCheck,
  BookOpen,
  MessagesSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UbuntuAI" }] }),
  component: Dashboard,
});

const quickActions = [
  { title: "Draft an email", to: "/email", icon: Mail, color: "text-primary bg-primary/10" },
  { title: "Summarise meeting", to: "/meetings", icon: FileText, color: "text-success bg-success/10" },
  { title: "Plan tasks", to: "/tasks", icon: CalendarCheck, color: "text-gold-foreground bg-gold/20" },
  { title: "Research policy", to: "/research", icon: BookOpen, color: "text-primary bg-primary/10" },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Welcome back"
        description="Your AI workplace assistant — built for South African SMEs."
        icon={<LayoutDashboard className="h-5 w-5" />}
      >
        <Button asChild>
          <Link to="/chat"><MessagesSquare className="mr-1.5 h-4 w-4" /> Open chatbot</Link>
        </Button>
      </PageHeader>

      <AiNotice />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Productivity" value="Boosted" icon={TrendingUp} accent="text-success" />
        <StatCard label="Compliance Awareness" value="Active" icon={CheckCircle2} accent="text-primary" />
        <StatCard label="AI Tools" value="6 live" icon={Sparkles} accent="text-gold-foreground" />
        <StatCard label="Region" value="🇿🇦 South Africa" icon={BookOpen} accent="text-primary" />
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-3 rounded-lg border bg-background p-4 transition hover:border-primary/40 hover:shadow-card"
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${a.color}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">Start now</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ToolCard
          to="/email"
          icon={Mail}
          title="Smart Email Generator"
          desc="Warning letters, leave approvals, performance feedback, client emails."
        />
        <ToolCard
          to="/meetings"
          icon={FileText}
          title="Meeting Minutes & Actions"
          desc="Paste raw notes — get structured minutes, decisions, and action items."
        />
        <ToolCard
          to="/tasks"
          icon={CalendarCheck}
          title="Employee Task Planner"
          desc="Daily schedules and weekly plans with productivity tips."
        />
        <ToolCard
          to="/research"
          icon={BookOpen}
          title="Workplace Research Assistant"
          desc="Leave, notice, overtime, disciplinary procedures — in plain English."
        />
        <ToolCard
          to="/chat"
          icon={MessagesSquare}
          title="UbuntuAI Chatbot"
          desc="Conversational expert for any workplace productivity task."
        />
        <ToolCard
          to="/prompts"
          icon={Sparkles}
          title="Prompt Library"
          desc="Ready-made prompts that follow the Role / Task / Context / Output framework."
        />
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent,
}: { label: string; value: string; icon: React.ElementType; accent: string }) {
  return (
    <Card className="bg-gradient-card shadow-card">
      <CardContent className="flex items-center gap-3 p-5">
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-base font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ToolCard({
  to, icon: Icon, title, desc,
}: { to: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full bg-gradient-card shadow-card transition hover:shadow-lift">
        <CardContent className="p-5">
          <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          <div className="mt-3 flex items-center text-sm font-medium text-primary">
            Open <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
