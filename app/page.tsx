"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { departments } from "@/lib/data";
import { getSession, saveSession, Session, defaultSession } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/firebase";
import { signUp } from "@/lib/firestoreStore";

type Step = "splash" | "identity" | "department" | "role";

export default function LandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("splash");
  const [form, setForm] = useState<Session>(defaultSession);
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const existing = getSession();
    if (existing.onboarded && !isFirebaseConfigured) {
      router.replace("/feed");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;

  async function finish() {
    setError("");
    if (isFirebaseConfigured) {
      setSubmitting(true);
      try {
        await signUp(
          form.name,
          form.email,
          password,
          form.departmentId,
          form.level
        );
        router.push("/feed");
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Couldn't create your account."
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }
    saveSession({ ...form, onboarded: true });
    router.push("/feed");
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-6 py-10">
      <BackgroundGlow />

      {step === "splash" && (
        <div className="relative z-10 flex flex-1 flex-col justify-between">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-pill border border-line bg-panel px-3 py-1.5 text-xs text-muted">
              <ShieldCheck size={14} className="text-verify" />
              Powered by AI · UNILAG Pilot
            </div>
          </div>

          <div className="animate-rise" style={{ animationDelay: "80ms" }}>
            <h1 className="font-display text-5xl italic leading-[1.05] text-ink">
              Campus
              <br />
              Truth
            </h1>
            <p className="mt-4 max-w-[280px] text-base text-muted">
              Your campus, decoded. Official updates and class rep news, in
              one feed you can actually trust.
            </p>
          </div>

          <button
            onClick={() => setStep("identity")}
            className="animate-rise flex items-center justify-center gap-2 rounded-pill bg-ink py-4 text-base font-semibold text-void transition-transform active:scale-[0.98]"
            style={{ animationDelay: "160ms" }}
          >
            Get started
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {step === "identity" && (
        <div className="relative z-10 flex flex-1 flex-col justify-between">
          <div className="animate-rise">
            <p className="text-sm text-muted">Step 1 of 3</p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Who's asking?
            </h2>
            <p className="mt-2 text-sm text-muted">
              This is what other students see if you post an update.
            </p>

            <div className="mt-8 space-y-4">
              <Field
                label="Full name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Aderogba Samuel"
              />
              <Field
                label="School email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                placeholder="you@unilag.edu.ng"
                type="email"
              />
              {isFirebaseConfigured && (
                <Field
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  type="password"
                />
              )}
            </div>
          </div>

          <button
            onClick={() => setStep("department")}
            disabled={
              !form.name ||
              !form.email ||
              (isFirebaseConfigured && password.length < 6)
            }
            className="rounded-pill bg-ink py-4 text-base font-semibold text-void transition-transform disabled:opacity-40 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}

      {step === "department" && (
        <div className="relative z-10 flex flex-1 flex-col justify-between">
          <div className="animate-rise">
            <p className="text-sm text-muted">Step 2 of 3</p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Where do you belong?
            </h2>
            <p className="mt-2 text-sm text-muted">
              We'll prioritize updates for your department and level.
            </p>

            <div className="mt-6 space-y-2">
              {departments
                .filter((d) => d.id !== "gen")
                .map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setForm({ ...form, departmentId: d.id })}
                    className={`w-full rounded-card border px-4 py-3 text-left transition-colors ${
                      form.departmentId === d.id
                        ? "border-signal bg-signaldim"
                        : "border-line bg-panel"
                    }`}
                  >
                    <div className="text-sm font-medium text-ink">{d.name}</div>
                    <div className="text-xs text-muted">{d.faculty}</div>
                  </button>
                ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {(
                departments.find((d) => d.id === form.departmentId)?.levels ??
                []
              ).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setForm({ ...form, level: lvl })}
                  className={`rounded-pill border px-4 py-2 text-sm ${
                    form.level === lvl
                      ? "border-verify bg-verifydim text-verify"
                      : "border-line text-muted"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep("role")}
            className="rounded-pill bg-ink py-4 text-base font-semibold text-void transition-transform active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      )}

      {step === "role" && (
        <div className="relative z-10 flex flex-1 flex-col justify-between">
          <div className="animate-rise">
            <p className="text-sm text-muted">Step 3 of 3</p>
            <h2 className="mt-2 font-display text-3xl text-ink">
              Are you a class rep?
            </h2>
            <p className="mt-2 text-sm text-muted">
              Class reps get a verified badge and can post directly to their
              department's feed. You can request this later too.
            </p>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => setForm({ ...form, isClassRep: true })}
                className={`w-full rounded-card border px-4 py-4 text-left transition-colors ${
                  form.isClassRep
                    ? "border-signal bg-signaldim"
                    : "border-line bg-panel"
                }`}
              >
                <div className="text-sm font-medium text-ink">
                  Yes, I'm a class rep
                </div>
                <div className="text-xs text-muted">
                  We'll flag your posts as "Class rep" updates
                </div>
              </button>
              <button
                onClick={() => setForm({ ...form, isClassRep: false })}
                className={`w-full rounded-card border px-4 py-4 text-left transition-colors ${
                  !form.isClassRep
                    ? "border-signal bg-signaldim"
                    : "border-line bg-panel"
                }`}
              >
                <div className="text-sm font-medium text-ink">
                  No, just here for updates
                </div>
                <div className="text-xs text-muted">
                  You can still submit tips for verification
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {error && <p className="text-center text-xs text-flag">{error}</p>}
            <button
              onClick={finish}
              disabled={submitting}
              className="w-full rounded-pill bg-verify py-4 text-base font-semibold text-void transition-transform disabled:opacity-60 active:scale-[0.98]"
            >
              {submitting ? "Setting things up…" : "Enter Campus Truth"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
      />
    </label>
  );
}

function BackgroundGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -left-32 -top-20 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
      style={{
        background:
          "radial-gradient(circle, #4FD1C5 0%, #E7B44E 45%, transparent 70%)",
      }}
    />
  );
}
