"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  FileText,
  Flag,
  Inbox,
  Lightbulb,
  Link2,
  PlayCircle,
  User,
  Users,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type SubmissionStatus = "pending" | "reviewed";

interface Submission {
  id: string;
  teamName: string;
  members: string[];
  problemStatement: string;
  ideaSubmission: string;
  githubRepo: string;
  demoVideoUrl: string;
  presentationDeckName: string;
  presentationDeckUrl: string;
  status: SubmissionStatus;
  overallScore?: number;
}

interface Rubric {
  id: string;
  label: string;
  description: string;
  maxScore: number;
  weight: number; // percentage weight, all rubric weights should sum to 100
}

// ─────────────────────────────────────────────
// ASSIGNED HACKATHON CONTEXT — replace with real fetch from actions.ts
// (e.g. getAssignedHackathon(reviewerId) — assumes one active assignment)
// ─────────────────────────────────────────────
const ASSIGNED_HACKATHON = {
  name: "EcoStream Hackathon 2026",
  date: "Dec 14–16, 2026",
};

// ─────────────────────────────────────────────
// SCORING RUBRICS — replace with real fetch if rubrics are configurable per hackathon
// ─────────────────────────────────────────────
const RUBRICS: Rubric[] = [
  { id: "innovation", label: "Innovation & Originality", description: "Novelty of the idea and approach.", maxScore: 10, weight: 20 },
  { id: "technical", label: "Technical Execution", description: "Code quality, architecture, and functionality.", maxScore: 10, weight: 25 },
  { id: "problem_fit", label: "Problem-Solution Fit", description: "How well the solution addresses the stated problem.", maxScore: 10, weight: 20 },
  { id: "presentation", label: "Presentation Quality", description: "Clarity of the pitch, deck, and demo.", maxScore: 10, weight: 15 },
  { id: "impact", label: "Impact & Scalability", description: "Real-world potential and ability to scale.", maxScore: 10, weight: 20 },
];

const TOTAL_WEIGHT = RUBRICS.reduce((sum, r) => sum + r.weight, 0); // should equal 100

// ─────────────────────────────────────────────
// MOCK DATA — replace with real fetches from actions.ts
// ─────────────────────────────────────────────
const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    teamName: "Team Mesh",
    members: ["Aarav Sharma", "Diya Patel", "Kabir Nair"],
    problemStatement:
      "Rural and disaster-affected areas often lose internet connectivity, cutting off access to emergency communication and critical environmental sensor data.",
    ideaSubmission:
      "IoT-Mesh is a self-healing mesh network of low-power sensor nodes that relay environmental and emergency data peer-to-peer, even when centralized infrastructure is down.",
    githubRepo: "https://github.com/ecostream/iot-mesh",
    demoVideoUrl: "https://vimeo.com/123456789",
    presentationDeckName: "IoT-Mesh_FinalDeck.pdf",
    presentationDeckUrl: "#",
    status: "pending",
  },
  {
    id: "sub-2",
    teamName: "Team Greenwave",
    members: ["Sara Khan", "Ishaan Verma"],
    problemStatement:
      "Urban farms lack affordable, real-time soil and water quality monitoring, leading to inefficient resource use and lower yields.",
    ideaSubmission:
      "Greenwave is a solar-powered sensor pod paired with a predictive irrigation app that reduces water usage by up to 30% for small-scale urban farmers.",
    githubRepo: "https://github.com/greenwave/sensor-pod",
    demoVideoUrl: "https://vimeo.com/987654321",
    presentationDeckName: "Greenwave_Pitch.pptx",
    presentationDeckUrl: "#",
    status: "reviewed",
    overallScore: 86,
  },
  {
    id: "sub-3",
    teamName: "Team Pulse",
    members: ["Meera Iyer", "Rohan Gupta", "Tara Singh"],
    problemStatement:
      "Patients in low-resource clinics face long diagnostic delays due to a shortage of trained radiologists.",
    ideaSubmission:
      "Pulse is a lightweight on-device ML model that pre-screens chest X-rays for common conditions, flagging urgent cases for radiologist review.",
    githubRepo: "https://github.com/pulse-health/xray-screen",
    demoVideoUrl: "https://vimeo.com/192837465",
    presentationDeckName: "Pulse_Deck_Final.pdf",
    presentationDeckUrl: "#",
    status: "reviewed",
    overallScore: 91,
  },
];

// ─────────────────────────────────────────────
// HELPERS — colored with real design tokens
// secondary (rose) = Reviewer's brand color, same family as the
// Reviewer Login button / "Innovation" hero text on the landing page
// tertiary (green) = same token Organizer uses, kept for "done/positive" states
// ─────────────────────────────────────────────
function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return status === "reviewed" ? (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-tertiary/10 text-tertiary">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Reviewed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold bg-secondary/15 text-secondary">
      <Clock className="w-3.5 h-3.5" />
      Pending
    </span>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
type View = "submissions" | "detail";

export default function ReviewerDashboard() {
  const [view, setView] = useState<View>("submissions");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  // rubricId -> score
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSubmission = MOCK_SUBMISSIONS.find((s) => s.id === selectedSubmissionId) || null;

  const totalScore = useMemo(() => {
    const weighted = RUBRICS.reduce((sum, rubric) => {
      const raw = rubricScores[rubric.id] ?? 0;
      const contribution = (raw / rubric.maxScore) * rubric.weight;
      return sum + contribution;
    }, 0);
    return Math.round(weighted * 10) / 10; // round to 1 decimal
  }, [rubricScores]);

  const openSubmission = (id: string) => {
    setSelectedSubmissionId(id);
    setRubricScores({});
    setCommentInput("");
    setView("detail");
  };

  const backToSubmissions = () => {
    setSelectedSubmissionId(null);
    setView("submissions");
  };

  const setRubricScore = (rubricId: string, maxScore: number, raw: string) => {
    const value = raw === "" ? 0 : Math.max(0, Math.min(maxScore, Number(raw)));
    setRubricScores((prev) => ({ ...prev, [rubricId]: value }));
  };

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    try {
      setIsSubmitting(true);
      const payload = {
        assignment_id: "demo-assignment-id",
        reviewer_id: "demo-reviewer-id",
        idea_id: selectedSubmission.id,
        score: totalScore,
        feedback: commentInput
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/evaluations/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(`Review submitted — Overall Score: ${totalScore}/100`);
        backToSubmissions();
      } else {
        alert("Failed to submit review");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md relative">
      <style jsx global>{`
        .reviewer-hero-gradient {
          background: radial-gradient(circle at top right, #f2c3b933 0%, transparent 50%),
                      radial-gradient(circle at bottom left, #97b3ae22 0%, transparent 50%);
        }
      `}</style>

      {/* Decorative gradient backdrop, same family as landing page hero */}
      <div className="absolute inset-0 reviewer-hero-gradient pointer-events-none" />

      {/* Top bar */}
      <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 md:px-8 h-20 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center mt-1">
                <Image src="/logo.png" alt="HackOS" width={840} height={240} className="h-60 w-auto object-contain" />
            </Link>
            <span className="hidden md:inline text-on-surface-variant text-[13px] ml-2 pl-3 border-l border-outline-variant/40">
              Reviewer Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-secondary" />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 md:px-8 py-10 max-w-[1280px] mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* ───────────── SUBMISSIONS LIST VIEW (landing page after login) ───────────── */}
          {view === "submissions" && (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wide mb-4">
                  REVIEWER DASHBOARD
                </span>
                <h1 className="font-headline-md text-[28px] md:text-[32px] mb-2 tracking-tight">
                  {ASSIGNED_HACKATHON.name}
                </h1>
                <div className="flex items-center gap-4 text-on-surface-variant text-[14px]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-tertiary" />
                    {ASSIGNED_HACKATHON.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-tertiary" />
                    {MOCK_SUBMISSIONS.length} teams submitted
                  </span>
                </div>
              </div>

              {MOCK_SUBMISSIONS.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 text-center border border-white/50">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-7 h-7 text-secondary/60" />
                  </div>
                  <p className="text-on-surface-variant">No submissions yet for this hackathon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {MOCK_SUBMISSIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openSubmission(s.id)}
                      className="cursor-pointer text-left bg-white/80 backdrop-blur-xl rounded-2xl p-6 hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4 flex-wrap group border border-white/50 hover:border-secondary/30"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-tertiary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-[17px] group-hover:text-secondary transition-colors">
                            {s.teamName}
                          </h3>
                          <p className="text-on-surface-variant text-[14px]">{s.members.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {s.status === "reviewed" && s.overallScore !== undefined && (
                          <span className="font-bold text-tertiary text-[16px]">
                            {s.overallScore}/100
                          </span>
                        )}
                        <SubmissionStatusBadge status={s.status} />
                        <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 group-hover:text-secondary transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ───────────── SUBMISSION DETAIL VIEW ───────────── */}
          {view === "detail" && selectedSubmission && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={backToSubmissions}
                className="cursor-pointer flex items-center gap-2 text-on-surface-variant hover:text-secondary transition-colors mb-6 text-[14px] font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to {ASSIGNED_HACKATHON.name}
              </button>

              {/* Team header */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 mb-6 flex items-center justify-between flex-wrap gap-4 border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-tertiary" />
                  </div>
                  <div>
                    <h1 className="font-headline-sm text-[24px] tracking-tight">{selectedSubmission.teamName}</h1>
                    <p className="text-on-surface-variant text-[14px]">
                      {selectedSubmission.members.join(" • ")}
                    </p>
                  </div>
                </div>
                <SubmissionStatusBadge status={selectedSubmission.status} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: submission content */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* 1. Problem Statement */}
                  <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <Flag className="w-4.5 h-4.5 text-secondary" />
                      </div>
                      <h2 className="font-headline-sm text-[18px]">Problem Statement</h2>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {selectedSubmission.problemStatement}
                    </p>
                  </section>

                  {/* 2. Idea Submission */}
                  <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
                        <Lightbulb className="w-4.5 h-4.5 text-tertiary" />
                      </div>
                      <h2 className="font-headline-sm text-[18px]">Idea Submission</h2>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {selectedSubmission.ideaSubmission}
                    </p>
                  </section>

                  {/* 3. GitHub Repository */}
                  <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-on-surface/10 flex items-center justify-center">
                        <Code2 className="w-4.5 h-4.5 text-on-surface" />
                      </div>
                      <h2 className="font-headline-sm text-[18px]">GitHub Repository</h2>
                    </div>
                    <a
                      href={selectedSubmission.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-surface-container-low rounded-2xl px-5 py-3.5 hover:bg-surface-container transition-colors group border border-outline-variant/20"
                    >
                      <Link2 className="w-4.5 h-4.5 text-on-surface-variant flex-shrink-0" />
                      <span className="text-on-surface group-hover:text-secondary transition-colors truncate">
                        {selectedSubmission.githubRepo}
                      </span>
                    </a>
                  </section>

                  {/* 4. Demo Video */}
                  <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <PlayCircle className="w-4.5 h-4.5 text-secondary" />
                      </div>
                      <h2 className="font-headline-sm text-[18px]">Demo Video</h2>
                    </div>
                    <a
                      href={selectedSubmission.demoVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-secondary/10 rounded-2xl px-5 py-3.5 hover:bg-secondary/15 transition-colors group border border-secondary/10"
                    >
                      <PlayCircle className="w-4.5 h-4.5 text-secondary flex-shrink-0" />
                      <span className="text-on-surface group-hover:text-secondary transition-colors truncate">
                        {selectedSubmission.demoVideoUrl}
                      </span>
                    </a>
                  </section>

                  {/* 5. Presentation Deck */}
                  <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center">
                        <FileText className="w-4.5 h-4.5 text-tertiary" />
                      </div>
                      <h2 className="font-headline-sm text-[18px]">Presentation Deck</h2>
                    </div>
                    <a
                      href={selectedSubmission.presentationDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-tertiary/10 rounded-2xl px-5 py-3.5 hover:bg-tertiary/15 transition-colors group border border-tertiary/10"
                    >
                      <FileText className="w-4.5 h-4.5 text-tertiary flex-shrink-0" />
                      <span className="text-on-surface group-hover:text-tertiary transition-colors">
                        {selectedSubmission.presentationDeckName}
                      </span>
                    </a>
                  </section>
                </div>

                {/* Right: rubric-based review panel */}
                <div className="lg:col-span-1">
                  <div className="bg-secondary-container rounded-3xl p-8 sticky top-28">
                    <h2 className="font-headline-sm text-[18px] text-on-secondary-container mb-1">
                      Score by Rubric
                    </h2>
                    <p className="text-on-secondary-container/70 text-[13px] mb-6">
                      Enter a score (0–10) for each criterion. Overall score is weighted out of 100.
                    </p>

                    {/* Rubric score inputs */}
                    <div className="flex flex-col gap-4 mb-6">
                      {RUBRICS.map((rubric) => {
                        const value = rubricScores[rubric.id] ?? 0;
                        const weighted = Math.round(((value / rubric.maxScore) * rubric.weight) * 10) / 10;
                        return (
                          <div key={rubric.id} className="bg-white/50 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <label
                                htmlFor={`rubric-${rubric.id}`}
                                className="text-on-secondary-container text-[13.5px] font-bold"
                              >
                                {rubric.label}
                              </label>
                              <span className="text-on-secondary-container/70 text-[11px] font-bold bg-white/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                                {rubric.weight}% weight
                              </span>
                            </div>
                            <p className="text-on-secondary-container/65 text-[12px] mb-3 leading-snug">
                              {rubric.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5">
                                <input
                                  id={`rubric-${rubric.id}`}
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  max={rubric.maxScore}
                                  step={1}
                                  value={rubricScores[rubric.id] ?? ""}
                                  onChange={(e) => setRubricScore(rubric.id, rubric.maxScore, e.target.value)}
                                  placeholder="0"
                                  className="w-16 px-3 py-2 rounded-lg bg-white border border-white/80 text-on-surface text-center font-bold focus:outline-none focus:ring-2 focus:ring-on-secondary-container/30"
                                />
                                <span className="text-on-secondary-container/70 text-[13px] font-medium">
                                  / {rubric.maxScore}
                                </span>
                              </div>
                              <span className="ml-auto text-on-secondary-container text-[12px] font-bold tabular-nums">
                                +{weighted} pts
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total score */}
                    <div className="bg-white/60 rounded-2xl px-5 py-4 mb-6 flex items-center justify-between">
                      <span className="text-on-secondary-container font-bold text-[14px]">Overall Score</span>
                      <span className="text-on-secondary-container font-bold text-[20px] tabular-nums">
                        {totalScore}
                        <span className="text-[14px] font-medium text-on-secondary-container/60">/100</span>
                      </span>
                    </div>

                    <label className="block text-on-secondary-container/80 text-[14px] mb-2 font-medium">
                      Feedback / Comments
                    </label>
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Share feedback for the team..."
                      rows={4}
                      className="w-full mb-6 px-4 py-3 rounded-xl bg-white/70 border border-white/50 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-on-secondary-container/30 resize-none"
                    />

                    <button 
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}