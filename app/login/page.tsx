"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getSession, saveSession } from "@/lib/store";
import { isFirebaseConfigured } from "@/lib/firebase";
import { signIn } from "@/lib/firestoreStore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function continueIn() {
    setError("");
    if (isFirebaseConfigured) {
      setSubmitting(true);
      try {
        await signIn(email, password);
        router.push("/feed");
      } catch {
        setError("Couldn't sign you in — check your email and password.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const existing = getSession();
    if (existing.onboarded && existing.email.toLowerCase() === email.toLowerCase()) {
      router.push("/feed");
      return;
    }
    saveSession({ ...existing, email, onboarded: false });
    router.push("/");
  }

  return (
    <main className="flex min-h-screen flex-col justify-between px-6 py-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-pill border border-line bg-panel px-3 py-1.5 text-xs text-muted">
          <ShieldCheck size={14} className="text-verify" />
          Powered by AI · UNILAG Pilot
        </div>
        <h1 className="mt-8 font-display text-3xl text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in with the school email you used to set up Campus Truth.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted">School email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@unilag.edu.ng"
              className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
            />
          </label>
          {isFirebaseConfigured && (
            <label className="block">
              <span className="text-xs font-medium text-muted">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="mt-1.5 w-full rounded-card border border-line bg-panel px-4 py-3 text-ink placeholder:text-muted/60 focus:border-signal"
              />
            </label>
          )}
        </div>
        {error && <p className="mt-3 text-xs text-flag">{error}</p>}
      </div>

      <button
        onClick={continueIn}
        disabled={!email.trim() || submitting}
        className="flex items-center justify-center gap-2 rounded-pill bg-ink py-4 text-base font-semibold text-void disabled:opacity-40"
      >
        {submitting ? "Signing in…" : "Continue"}
        <ArrowRight size={18} />
      </button>
    </main>
  );
}
