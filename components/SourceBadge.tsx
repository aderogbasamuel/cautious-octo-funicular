import { SourceType } from "@/lib/types";
import { ShieldCheck, Users, MessageCircleQuestion } from "lucide-react";

export function SourceBadge({
  type,
  confidence,
}: {
  type: SourceType;
  confidence?: number;
}) {
  if (type === "official") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-verifydim px-2.5 py-1 text-xs font-medium text-verify">
        <ShieldCheck size={13} strokeWidth={2.25} />
        Official {confidence ? `· ${confidence}%` : ""}
      </span>
    );
  }
  if (type === "class-rep") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-signaldim px-2.5 py-1 text-xs font-medium text-signal">
        <Users size={13} strokeWidth={2.25} />
        Class rep
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-flagdim px-2.5 py-1 text-xs font-medium text-flag">
      <MessageCircleQuestion size={13} strokeWidth={2.25} />
      Unverified
    </span>
  );
}
