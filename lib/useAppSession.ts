"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "./firebase";
import { getUserProfile, watchAuth } from "./firestoreStore";
import { getSession, Session } from "./store";

export function useAppSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setSession(getSession());
      setLoading(false);
      return;
    }
    if (uid) {
      const profile = await getUserProfile(uid);
      if (profile) {
        setSession({
          name: profile.name,
          email: profile.email,
          departmentId: profile.departmentId,
          level: profile.level,
          isClassRep: profile.isClassRep,
          repStatus: profile.repStatus,
          onboarded: true,
        });
      }
    }
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSession(getSession());
      setLoading(false);
      return;
    }
    const unsub = watchAuth((user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setSession(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (uid) refresh();
  }, [uid, refresh]);

  return { session, loading, refresh, uid };
}
