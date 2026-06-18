import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { UbuntuLogo } from "@/components/UbuntuLogo";
import { ArrowRight, Mail, FileText, CalendarCheck, BookOpen, MessagesSquare, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UbuntuAI — Helping SA businesses work smarter & stay compliant" },
      {
        name: "description",
        content:
          "UbuntuAI is the AI workplace assistant built for South African SMEs. Draft emails, summarise meetings, plan tasks, and research workplace compliance — in one place.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft warning letters, leave approvals, feedback, and client emails in seconds." },
  { icon: FileText, title: "Meeting Minutes & Actions", desc: "Turn raw notes into structured summaries with action items and owners." },
  { icon: CalendarCheck, title: "Task Planner", desc: "Auto-build daily and weekly schedules tuned to South African work rhythms." },
  { icon: BookOpen, title: "Workplace Research", desc: "Plain-English answers on leave, notice periods, overtime, and procedures." },
  { icon: MessagesSquare, title: "UbuntuAI Chatbot", desc: "Your always-on workplace expert for documents, planning, and policy." },
  { icon: ShieldCheck, title: "Responsible AI", desc: "Human oversight built-in, with clear disclaimers and privacy guidance." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <UbuntuLogo className="h-8 w-8" />
            <span className="font-bold text-foreground">UbuntuAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild><Link to="/auth">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Built for South African SMEs
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Work smarter. Communicate better. Stay compliant.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85">
              UbuntuAI is the AI-powered workplace assistant that helps South African businesses automate
              admin, summarise meetings, plan tasks, and answer compliance questions — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link to="/auth">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                <Link to="/dashboard">Explore dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Everything your team needs</h2>
          <p className="mt-2 text-muted-foreground">Six tools, one proudly South African workplace assistant.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-gradient-card p-6 shadow-card transition hover:shadow-lift">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} UbuntuAI. Proudly South African.</span>
          <span>Informational only — not a substitute for legal or HR advice.</span>
        </div>
      </footer>
    </div>
  );
}
