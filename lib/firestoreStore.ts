"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { Post } from "./types";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  departmentId: string;
  level: string;
  isClassRep: boolean;
  repStatus: "none" | "pending" | "approved" | "denied";
};

export type RepRequest = {
  id: string;
  uid: string;
  name: string;
  email: string;
  departmentId: string;
  level: string;
  status: "pending" | "approved" | "denied";
  requestedAt: string;
};

// ---------- Auth ----------

export function watchAuth(callback: (user: User | null) => void) {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

export async function signUp(
  name: string,
  email: string,
  password: string,
  departmentId: string,
  level: string
): Promise<UserProfile> {
  if (!auth || !db) throw new Error("Firebase is not configured.");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const profile: UserProfile = {
    uid: cred.user.uid,
    name,
    email,
    departmentId,
    level,
    isClassRep: false,
    repStatus: "none",
  };
  await setDoc(doc(db, "users", cred.user.uid), profile);
  return profile;
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error("Firebase is not configured.");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser() {
  if (!auth) return;
  return signOut(auth);
}

// ---------- User profile ----------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), data);
}

// ---------- Posts ----------

export async function fetchPosts(): Promise<Post[]> {
  if (!db) return [];
  const q = query(collection(db, "posts"), orderBy("postedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
}

export async function createPost(post: Omit<Post, "id">): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  const ref = await addDoc(collection(db, "posts"), post);
  return ref.id;
}

// ---------- Class rep verification requests ----------

export async function requestVerification(profile: UserProfile) {
  if (!db) throw new Error("Firebase is not configured.");
  await addDoc(collection(db, "repRequests"), {
    uid: profile.uid,
    name: profile.name,
    email: profile.email,
    departmentId: profile.departmentId,
    level: profile.level,
    status: "pending",
    requestedAt: serverTimestamp(),
  });
  await updateUserProfile(profile.uid, { repStatus: "pending" });
}

export async function listPendingRequests(): Promise<RepRequest[]> {
  if (!db) return [];
  const q = query(
    collection(db, "repRequests"),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RepRequest);
}

export async function decideRequest(
  request: RepRequest,
  approve: boolean
) {
  if (!db) return;
  await updateDoc(doc(db, "repRequests", request.id), {
    status: approve ? "approved" : "denied",
  });
  await updateUserProfile(request.uid, {
    isClassRep: approve,
    repStatus: approve ? "approved" : "denied",
  });
}
