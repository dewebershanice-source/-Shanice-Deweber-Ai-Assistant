import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export function AiOutput({ markdown, filename = "ubuntuai-output.md" }: { markdown: string; filename?: string }) {
  async function copy() {
    await navigator.clipboard.writeText(markdown);
    toast.success("Copied to clipboard");
  }
  function download() {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  }
  return (
    <div className="rounded-xl border bg-gradient-card shadow-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Output
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={copy}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="ghost" onClick={download}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
          </Button>
        </div>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none px-5 py-4 prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-table:text-sm">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
