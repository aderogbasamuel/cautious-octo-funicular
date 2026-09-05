"use client";

import { useCallback, useEffect, useState } from "react";
import { isFirebaseConfigured } from "./firebase";
import { fetchPosts } from "./firestoreStore";
import { posts as seedPosts } from "./data";
import { getSubmittedPosts } from "./store";
import { Post } from "./types";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>(() =>
    isFirebaseConfigured ? [] : [...getSubmittedPosts(), ...seedPosts]
  );
  const [loading, setLoading] = useState(isFirebaseConfigured);

  const refresh = useCallback(async () => {
    if (!isFirebaseConfigured) {
      setPosts(
        [...getSubmittedPosts(), ...seedPosts].sort(
          (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        )
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    const live = await fetchPosts();
    // Seed data still shows alongside live posts so the feed isn't empty
    // on a freshly created Firebase project.
    setPosts(
      [...live, ...seedPosts].sort(
        (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      )
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { posts, loading, refresh };
}
