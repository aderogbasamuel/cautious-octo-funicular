import { Department, Post } from "./types";

export const departments: Department[] = [
  { id: "gen", faculty: "General", name: "All of UNILAG", levels: ["All levels"] },
  {
    id: "cbe",
    faculty: "Engineering",
    name: "Computer Engineering",
    levels: ["100L", "200L", "300L", "400L", "500L"],
  },
  {
    id: "eee",
    faculty: "Engineering",
    name: "Electrical/Electronics Engineering",
    levels: ["100L", "200L", "300L", "400L", "500L"],
  },
  {
    id: "csc",
    faculty: "Science",
    name: "Computer Science",
    levels: ["100L", "200L", "300L", "400L"],
  },
  {
    id: "acc",
    faculty: "Management Sciences",
    name: "Accounting",
    levels: ["100L", "200L", "300L", "400L"],
  },
  {
    id: "law",
    faculty: "Law",
    name: "Law",
    levels: ["100L", "200L", "300L", "400L", "500L"],
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    title: "UNILAG Senate Approves New Academic Calendar",
    body: "The Senate has approved minor adjustments to the academic calendar. Week 7 now includes an additional lecture-free day planned for faculty restructuring. Departments have been notified to update their course outlines accordingly, and affected exam timetables will be republished within the week.",
    departmentId: "general",
    sourceType: "official",
    sourceName: "UNILAG Official IG",
    confidence: 98,
    postedAt: daysAgo(0, 27),
    history: [
      { label: "First reported", timestamp: daysAgo(0, 27), note: "Posted on UNILAG Official IG" },
      { label: "Cross-checked", timestamp: daysAgo(0, 20), note: "Matches Registry portal notice" },
    ],
    tags: ["academic calendar", "senate"],
  },
  {
    id: "p2",
    title: "Revised Hostel Ballot Schedule Released",
    body: "The Students Affairs Division has revised the hostel balloting timeline for the new session. Ballot results for Moremi and Mariere halls now drop on the portal a week earlier than originally planned, while El-kanemi hall balloting shifts two days later.",
    departmentId: "general",
    sourceType: "official",
    sourceName: "Students Affairs Division",
    confidence: 95,
    postedAt: daysAgo(0, 40),
    history: [{ label: "First reported", timestamp: daysAgo(0, 40), note: "Portal notice" }],
    tags: ["hostel", "balloting"],
  },
  {
    id: "p3",
    title: "CPE 301 Test Moved to Friday",
    body: "The CPE 301 (Digital Logic Design) test originally scheduled for Wednesday has been moved to Friday, same time, same venue (New Engineering Lecture Theatre 2). Bring your calculator — no phones allowed at the venue.",
    departmentId: "cbe",
    sourceType: "class-rep",
    sourceName: "Samuel A. — 300L Class Rep",
    confidence: 0,
    postedAt: daysAgo(1, 0),
    authorName: "Samuel A.",
    history: [{ label: "Posted by class rep", timestamp: daysAgo(1, 0) }],
    tags: ["CPE301", "test"],
  },
  {
    id: "p4",
    title: "Faculty of Engineering Fee Deadline: 12 Nov",
    body: "The last official deadline announced by UNILAG Senate for school fee payment was 12 Nov 2025. No new update on an extension yet — treat any WhatsApp forward claiming otherwise as unverified until it shows up here.",
    departmentId: "general",
    sourceType: "official",
    sourceName: "UNILAG Bursary",
    confidence: 92,
    postedAt: daysAgo(2, 0),
    history: [
      { label: "First reported", timestamp: daysAgo(6, 0), note: "Bursary circular" },
      { label: "Reconfirmed", timestamp: daysAgo(2, 0), note: "No extension announced" },
    ],
    tags: ["fees", "deadline"],
  },
  {
    id: "p5",
    title: "EEE 305 Group Project Groups Are Out",
    body: "Project groups for EEE 305 have been posted on the department noticeboard and in the class WhatsApp group. If your name is missing, see the course rep before Monday's lecture, not the lecturer directly.",
    departmentId: "eee",
    sourceType: "class-rep",
    sourceName: "Chidinma O. — 300L Class Rep",
    confidence: 0,
    postedAt: daysAgo(1, 12),
    authorName: "Chidinma O.",
    history: [{ label: "Posted by class rep", timestamp: daysAgo(1, 12) }],
    tags: ["EEE305", "project"],
  },
  {
    id: "p6",
    title: "Heard the library extends hours during exams — anyone confirm?",
    body: "Someone in the 200L group chat said the main library will stay open till midnight during the exam period. Posting here so it can get verified instead of spreading unconfirmed.",
    departmentId: "general",
    sourceType: "community",
    sourceName: "Anonymous student",
    confidence: 0,
    postedAt: daysAgo(0, 5),
    history: [{ label: "Submitted by student", timestamp: daysAgo(0, 5), note: "Awaiting verification" }],
    tags: ["library", "exams"],
  },
  {
    id: "p7",
    title: "UNILAG Uploads Last Set of Admission Lists",
    body: "The Admissions Office has uploaded the final batch of admission lists for the 2025/2026 session on the JAMB CAPS-linked portal. Affected candidates should check their status and begin the acceptance fee process before the stated window closes.",
    departmentId: "general",
    sourceType: "official",
    sourceName: "UNILAG Admissions",
    confidence: 97,
    postedAt: daysAgo(0, 2),
    history: [{ label: "First reported", timestamp: daysAgo(0, 2) }],
    tags: ["admissions"],
  },
];

function daysAgo(days: number, minutes: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
