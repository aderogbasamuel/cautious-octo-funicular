"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldAlert } from "lucide-react";
import { departments } from "@/lib/data";
import { useAppSession } from "@/lib/useAppSession";
import { isFirebaseConfigured } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/store";
import { decideRequest, listPendingRequests, RepRequest } from "@/lib/firestoreStore";
import { TopBar } from "@/components/TopBar";

export default function AdminPage() {
  const router = useRouter();
  const { session, loading } = useAppSession();
  const [requests, setRequests] = useState<RepRequest[]>([]);
  const [fetching, setFetching] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/");
      return;
    }
    if (!isAdminEmail(session.email)) {
      router.replace("/feed");
      return;
    }
    loadRequests();
  }, [loading, session, router]);

  async function loadRequests() {
    setFetching(true);
    const pending = await listPendingRequests();
    setRequests(pending);
    setFetching(false);
  }

  async function decide(request: RepRequest, approve: boolean) {
    setDecidingId(request.id);
    await decideRequest(request, approve);
    setRequests((r) => r.filter((req) => req.id !== request.id));
    setDecidingId(null);
  }

  if (!session || !isAdminEmail(session.email)) return null;

  if (!isFirebaseConfigured) {
    return (
      <main className="px-5 py-10">
        <TopBar title="Admin" back />
        <div className="mt-6 flex items-start gap-2 rounded-card border border-flag/30 bg-flagdim px-4 py-4 text-sm text-flag">
          <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
          <span>
            Admin approvals need Firebase configured — this app is running
            in demo mode (see .env.local.example). Verification requests
            aren't queued anywhere to approve yet.
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <TopBar title="Rep verification requests" back />

      <div className="space-y-3 px-5 py-4">
        {fetching && <p className="text-sm text-muted">Loading requests…</p>}

        {!fetching && requests.length === 0 && (
          <p className="rounded-card border border-line bg-panel px-4 py-6 text-center text-sm text-muted">
            No pending requests right now.
          </p>
        )}

        {requests.map((r) => {
          const dept = departments.find((d) => d.id === r.departmentId);
          return (
            <div
              key={r.id}
              className="rounded-card border border-line bg-panel px-4 py-4"
            >
              <div className="text-sm font-medium text-ink">{r.name}</div>
              <div className="text-xs text-muted">{r.email}</div>
              <div className="mt-1 text-xs text-muted">
                {dept?.name ?? r.departmentId} · {r.level}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => decide(r, true)}
                  disabled={decidingId === r.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-verify py-2.5 text-sm font-semibold text-void disabled:opacity-50"
                >
                  <Check size={15} />
                  Approve
                </button>
                <button
                  onClick={() => decide(r, false)}
                  disabled={decidingId === r.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-line py-2.5 text-sm text-muted disabled:opacity-50"
                >
                  <X size={15} />
                  Deny
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
