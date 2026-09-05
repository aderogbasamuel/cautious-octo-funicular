"use client";

import { Post } from "./types";

export type Session = {
  name: string;
  email: string;
  departmentId: string;
  level: string;
  isClassRep: boolean;
  repStatus: "none" | "pending" | "approved" | "denied";
  onboarded: boolean;
};

const SESSION_KEY = "ct_session";
const SAVED_KEY = "ct_saved";
const SUBMITTED_KEY = "ct_submitted";

export const defaultSession: Session = {
  name: "",
  email: "",
  departmentId: "cbe",
  level: "300L",
  isClassRep: false,
  repStatus: "none",
  onboarded: false,
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getSession(): Session {
  return read(SESSION_KEY, defaultSession);
}

export function saveSession(session: Session) {
  write(SESSION_KEY, session);
}

export function getSavedPostIds(): string[] {
  return read<string[]>(SAVED_KEY, []);
}

export function toggleSavedPost(postId: string): string[] {
  const current = getSavedPostIds();
  const next = current.includes(postId)
    ? current.filter((id) => id !== postId)
    : [...current, postId];
  write(SAVED_KEY, next);
  return next;
}

export function getSubmittedPosts(): Post[] {
  return read<Post[]>(SUBMITTED_KEY, []);
}

export function addSubmittedPost(post: Post) {
  const current = getSubmittedPosts();
  write(SUBMITTED_KEY, [post, ...current]);
}

export function isAdminEmail(email: string): boolean {
  const list = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
