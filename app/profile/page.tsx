"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Sparkles,
  ShieldCheck,
  Bell,
  Database,
  Settings,
  Bookmark,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { departments } from "@/lib/data";
import {
  defaultSession,
  getSavedPostIds,
  isAdminEmail,
  saveSession,
} from "@/lib/store";
import { useAppSession } from "@/lib/useAppSession";
import { usePosts } from "@/lib/usePosts";
import { isFirebaseConfigured } from "@/lib/firebase";
import { requestVerification, signOutUser, UserProfile } from "@/lib/firestoreStore";
import { PostCard } from "@/components/PostCard";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

type Panel = "root" | "saved" | "notifications" | "sources" | "account";

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, loading, refresh, uid } = useAppSession();
  const { posts: allPosts } = usePosts();
  const [panel, setPanel] = useState<Panel>(
    (searchParams.get("tab") as Panel) || "root"
  );
  const [notifyDeadlines, setNotifyDeadlines] = useState(true);
  const [notifyClassRep, setNotifyClassRep] = useState(true);
  const [notifyCommunity, setNotifyCommunity] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace("/");
  }, [loading, session, router]);

  if (!session) return null;

  const dept = departments.find((d) => d.id === session.departmentId);
  const savedIds = getSavedPostIds();
  const savedPosts = allPosts.filter((p) => savedIds.includes(p.id));

  async function logout() {
    if (isFirebaseConfigured) {
      await signOutUser();
    } else {
      saveSession(defaultSession);
    }
    router.replace("/");
  }

  async function handleRequestVerification() {
    if (!session) return;
    setRequesting(true);
    if (isFirebaseConfigured && uid) {
      await requestVerification({
        uid,
        name: session.name,
        email: session.email,
        departmentId: session.departmentId,
        level: session.level,
        isClassRep: session.isClassRep,
        repStatus: session.repStatus,
      } as UserProfile);
      await refresh();
    } else {
      // Demo mode: no admin to approve, so mark pending immediately and
      // note that a real deployment routes this through /admin.
      saveSession({ ...session, repStatus: "pending" });
      await refresh();
    }
    setRequesting(false);
  }

  if (panel === "saved") {
    return (
      <main className="pb-28">
        <TopBar title="Saved updates" back />
        <div className="space-y-3 px-5 py-4">
          {savedPosts.length === 0 && (
            <p className="rounded-card border border-line bg-panel px-4 py-6 text-center text-sm text-muted">
              Nothing saved yet. Tap the bookmark icon on any update.
            </p>
          )}
          {savedPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
        <BottomNav />
      </main>
    );
  }

  if (panel === "notifications") {
    return (
      <main className="pb-28">
        <TopBar title="Notification settings" back />
        <div className="space-y-3 px-5 py-4">
          <Toggle
            label="Deadline reminders"
            description="Fee, registration, and exam deadlines"
            checked={notifyDeadlines}
            onChange={setNotifyDeadlines}
          />
          <Toggle
            label="Class rep updates"
            description="Posts from your department's verified reps"
            checked={notifyClassRep}
            onChange={setNotifyClassRep}
          />
          <Toggle
            label="Community tips"
            description="Unverified reports before they're confirmed"
            checked={notifyCommunity}
            onChange={setNotifyCommunity}
          />
        </div>
        <BottomNav />
      </main>
    );
  }

  if (panel === "sources") {
    return (
      <main className="pb-28">
        <TopBar title="Data sources used" back />
        <div className="space-y-3 px-5 py-4 text-sm text-muted">
          <p>Campus Truth pulls from, in order of trust weighting:</p>
          <SourceRow name="UNILAG official portal & Senate circulars" weight="Highest" />
          <SourceRow name="UNILAG verified social accounts" weight="High" />
          <SourceRow name="Verified class representatives" weight="High" />
          <SourceRow name="Student-submitted tips" weight="Unverified until confirmed" />
          <p className="pt-2 text-xs text-muted/70">
            Every update shows where it came from and when it was last
            cross-checked — see "View source history" on any update.
          </p>
        </div>
        <BottomNav />
      </main>
    );
  }

  if (panel === "account") {
    return (
      <main className="pb-28">
        <TopBar title="Account settings" back />
        <div className="space-y-4 px-5 py-4">
          <Field label="Full name" value={session.name} />
          <Field label="Email" value={session.email} />
          <div>
            <span className="text-xs font-medium text-muted">Department</span>
            <div className="mt-1.5 rounded-card border border-line bg-panel px-4 py-3 text-ink">
              {dept?.name} · {session.level}
            </div>
          </div>

          {session.isClassRep ? (
            <div className="rounded-card border border-verify/30 bg-verifydim px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm text-verify">
                <ShieldCheck size={16} />
                You're a verified class rep
              </div>
            </div>
          ) : session.repStatus === "pending" ? (
            <div className="rounded-card border border-signal/30 bg-signaldim px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm text-signal">
                <Clock size={16} />
                Verification request pending
              </div>
              <div className="mt-1 text-xs text-muted">
                {isFirebaseConfigured
                  ? "An admin needs to approve this in /admin before it takes effect."
                  : "In demo mode this just flips the status locally — wire up /admin with Firebase to make it a real approval step."}
              </div>
            </div>
          ) : (
            <button
              onClick={handleRequestVerification}
              disabled={requesting}
              className="w-full rounded-card border border-line bg-panel px-4 py-3.5 text-left disabled:opacity-60"
            >
              <div className="flex items-center gap-2 text-sm text-ink">
                <ShieldCheck size={16} className="text-muted" />
                {requesting ? "Sending request…" : "Request class rep verification"}
              </div>
              <div className="mt-1 text-xs text-muted">
                {session.repStatus === "denied"
                  ? "Your last request was declined — you can try again."
                  : "Goes to an admin for approval, not granted automatically."}
              </div>
            </button>
          )}
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="pb-28">
      <TopBar title="Profile" />

      <div className="px-5 pt-4">
        <div className="rounded-card border border-line bg-panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signaldim font-display text-xl text-signal">
              {session.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <div className="font-display text-lg text-ink">
                {session.name || "Student"}
              </div>
              <div className="text-xs text-muted">{session.email}</div>
              <div className="text-xs text-muted">
                {dept?.name} · {session.level}
              </div>
            </div>
          </div>
          {session.isClassRep && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-verifydim px-2.5 py-1 text-xs text-verify">
              <ShieldCheck size={13} />
              Verified class rep
            </div>
          )}
        </div>

        <button className="mt-4 flex w-full items-center justify-between rounded-card border border-verify/30 bg-verifydim px-4 py-3.5">
          <div className="flex items-center gap-2.5 text-sm text-verify">
            <Sparkles size={16} />
            Get Premium — priority alerts, zero ads
          </div>
        </button>

        <div className="mt-5 space-y-2">
          <Row
            icon={<Bookmark size={17} />}
            label="Saved updates"
            onClick={() => setPanel("saved")}
          />
          <Row
            icon={<Bell size={17} />}
            label="Notification settings"
            onClick={() => setPanel("notifications")}
          />
          <Row
            icon={<Database size={17} />}
            label="Data sources used"
            onClick={() => setPanel("sources")}
          />
          <Row
            icon={<Settings size={17} />}
            label="Account settings"
            onClick={() => setPanel("account")}
          />
          {isAdminEmail(session.email) && (
            <Row
              icon={<ShieldAlert size={17} />}
              label="Admin: rep requests"
              onClick={() => router.push("/admin")}
            />
          )}
        </div>

        <button
          onClick={logout}
          className="mt-6 flex items-center gap-2 text-sm text-flag"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      <BottomNav />
    </main>
  );
}

function Row({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-card border border-line bg-panel px-4 py-3.5"
    >
      <div className="flex items-center gap-3 text-sm text-ink">
        <span className="text-muted">{icon}</span>
        {label}
      </div>
      <ChevronRight size={17} className="text-muted" />
    </button>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-card border border-line bg-panel px-4 py-3.5">
      <div>
        <div className="text-sm text-ink">{label}</div>
        <div className="text-xs text-muted">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
        className={`h-6 w-11 flex-shrink-0 rounded-pill transition-colors ${
          checked ? "bg-signal" : "bg-raised"
        }`}
      >
        <span
          className={`block h-5 w-5 translate-y-0.5 rounded-full bg-void transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SourceRow({ name, weight }: { name: string; weight: string }) {
  return (
    <div className="rounded-card border border-line bg-panel px-4 py-3">
      <div className="text-sm text-ink">{name}</div>
      <div className="text-xs text-muted">{weight}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink"
      />
    </label>
  );
}
