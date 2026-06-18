import { ShieldCheck } from "lucide-react";

export function AiNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-gold-foreground" />
        <p className="leading-relaxed">
          <span className="font-semibold">Responsible AI:</span> Review all UbuntuAI outputs before use. Verify
          legal and HR information independently. Do not upload confidential business data.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gold/40 bg-gold/10 p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold-foreground" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-foreground">Responsible AI Notice</p>
          <p className="text-muted-foreground leading-relaxed">
            UbuntuAI assists with productivity and compliance awareness. Review all AI-generated outputs
            before use, verify legal and HR information independently, consult a qualified professional
            where necessary, and avoid uploading confidential business information. UbuntuAI does not
            replace professional legal, HR, financial, or compliance advice.
          </p>
        </div>
      </div>
    </div>
  );
}
