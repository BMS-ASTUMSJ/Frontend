import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import {
  ClipboardList,
  Calendar,
  Trophy,
  CheckCircle,
  AlertTriangle,
  FileX,
  UserCircle,
  Code2,
  ExternalLink,
  Eye,
  X,
  FileText,
  Loader2,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  RotateCcw,
  BookOpen,
  Send,
  MessageSquare,
} from "lucide-react";

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================================
  // LOAD ASSIGNMENTS + SUBMISSIONS
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get("/assignments"),
        api.get("/submissions/my"),
      ]);

      setAssignments(assignmentsRes.data.assignments || []);
      setMySubmissions(submissionsRes.data.submissions || []);
    } catch (err) {
      console.error("Failed to load assignment data:", err);
      toast.error(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // GET SUBMISSION FOR ASSIGNMENT
  // ============================================================

  const getSubmission = (assignmentId) => {
    return mySubmissions.find((submission) => {
      const submissionAssignment = submission.assignment;
      if (submissionAssignment && typeof submissionAssignment === "object") {
        return submissionAssignment._id === assignmentId;
      }
      return submissionAssignment === assignmentId;
    });
  };

  // ============================================================
  // CHECK DEADLINE
  // ============================================================

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  // ============================================================
  // OPEN SUBMISSION MODAL
  // ============================================================

  const openSubmissionModal = (assignment) => {
    const submission = getSubmission(assignment._id);
    setSelectedId(assignment._id);

    if (submission?.status === "Resubmission Required") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");
      setIsUpdating(false);
      return;
    }

    if (submission?.status === "Pending") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");
      setIsUpdating(true);
      return;
    }

    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");
    setIsUpdating(false);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (submitting) return;
    setSelectedId(null);
    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");
    setIsUpdating(false);
  };

  // ============================================================
  // SUBMIT / UPDATE / RESUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      toast.error("Please select an assignment.");
      return;
    }

    if (!githubUrl.trim()) {
      toast.error("GitHub URL is required.");
      return;
    }

    const assignment = assignments.find((asm) => asm._id === selectedId);

    if (!assignment) {
      toast.error("Assignment could not be found.");
      return;
    }

    const existingSubmission = getSubmission(selectedId);
    const isResubmission =
      existingSubmission?.status === "Resubmission Required";
    const isPendingUpdate = existingSubmission?.status === "Pending";

    if (isExpired(assignment.deadline) && !isResubmission) {
      toast.error("The deadline for this assignment has passed.");
      return;
    }

    try {
      setSubmitting(true);

      if (isPendingUpdate) {
        const res = await api.put(`/submissions/${existingSubmission._id}`, {
          githubUrl: githubUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim(),
          notes: notes.trim(),
        });

        toast.success(res.data.message || "Submission updated successfully!");
        closeModal();
        await loadData();
        return;
      }

      const payload = {
        assignmentId: selectedId,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        notes: notes.trim(),
      };

      const res = await api.post("/submissions", payload);

      toast.success(
        res.data.message ||
          (isResubmission
            ? "Assignment resubmitted successfully!"
            : "Assignment submitted successfully!")
      );

      closeModal();
      await loadData();
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          Not Submitted
        </span>
      );
    }

    if (status === "Graded") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={12} /> Graded
        </span>
      );
    }

    if (status === "Resubmission Required") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-800">
          <AlertTriangle size={12} /> Resubmit Req.
        </span>
      );
    }

    if (status === "Pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-800">
          <Clock size={12} /> Pending Review
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Course Assignments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
          },
        }}
      />

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .modal-enter { animation: modalEnter 0.22s cubic-bezier(.2,.8,.2,1) both; }
        .smooth-transition { transition: all 220ms ease; }
        
        .heading-gradient {
          background: linear-gradient(90deg, #FFFFFF 0%, #FCD8BF 50%, #7EC8F5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hide-scrollbar::-webkit-scrollbar { height: 6px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(226, 109, 44, 0.3); border-radius: 999px; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Moving Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-8">

          {/* ======================================================
              1. TOP HEADER BANNER WITH GRADIENT TEXT
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <ClipboardList size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Course Deliverables
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Assignments & Project Submissions
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Submit your projects, track evaluation status, and review mentor comments.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RotateCcw size={16} className={`text-[#F38744] ${loading ? "animate-spin" : ""}`} />
                  <span>Sync Tasks</span>
                </button>
              </div>
            </div>
          </header>

          {/* ======================================================
              2. ASSIGNMENTS TABLE (Creamy Alabaster)
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[#EBDCC8] p-6">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Course Milestones
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Required programming deliverables and grading metrics
                </p>
              </div>

              <span className="rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] px-4 py-2 text-xs font-black text-[#173854]">
                Total: {assignments.length} Assignments
              </span>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center">
                <FileX className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">
                  No assignments available
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  There are currently no active course assignments posted for your cohort.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Assignment
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Instructor
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Deadline Date
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Max Points
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Status
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Earned Grade
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignments.map((asm) => {
                      const submission = getSubmission(asm._id);
                      const status = submission?.status || null;
                      const canResubmit = status === "Resubmission Required";
                      const isGraded = status === "Graded";
                      const isPending = status === "Pending";
                      const expired = isExpired(asm.deadline);

                      return (
                        <tr
                          key={asm._id}
                          className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        >
                          {/* ASSIGNMENT INFO */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-sm font-black text-[#173854]">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#16344E]">
                                  {asm.title}
                                </p>
                                <p className="mt-0.5 max-w-xs truncate text-[11px] font-medium text-slate-500">
                                  {asm.description || "No description provided."}
                                </p>
                                {submission?.feedback && (
                                  <button
                                    type="button"
                                    onClick={() => setFeedbackModal(submission.feedback)}
                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#1E6FA3] hover:underline"
                                  >
                                    <MessageSquare size={11} />
                                    <span>View Mentor Feedback</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* INSTRUCTOR */}
                          <td className="px-5 py-4.5 font-semibold text-slate-700">
                            {asm.instructorName || asm.instructor || "—"}
                          </td>

                          {/* DEADLINE */}
                          <td className="px-5 py-4.5">
                            {asm.deadline ? (
                              <div>
                                <p className={`text-xs font-bold ${expired ? "text-rose-600" : "text-[#16344E]"}`}>
                                  {new Date(asm.deadline).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {new Date(asm.deadline).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {expired && (
                                  <span className="inline-block mt-0.5 text-[9.5px] font-black uppercase text-rose-600">
                                    Deadline Passed
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">No deadline</span>
                            )}
                          </td>

                          {/* MAX SCORE */}
                          <td className="px-5 py-4.5 font-bold text-slate-700">
                            {asm.maxScore ?? "100"} pts
                          </td>

                          {/* STATUS BADGE */}
                          <td className="px-5 py-4.5">
                            {getStatusBadge(status)}
                          </td>

                          {/* GRADE */}
                          <td className="px-5 py-4.5">
                            {isGraded ? (
                              <span className="text-sm font-black text-emerald-700">
                                {submission.score}{" "}
                                <span className="text-xs font-normal text-slate-400">
                                  / {asm.maxScore || 100}
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* ACTION BUTTON */}
                          <td className="px-6 py-4.5 text-right">
                            {!submission && (
                              <button
                                type="button"
                                onClick={() => openSubmissionModal(asm)}
                                disabled={expired}
                                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-4 py-2 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 disabled:opacity-50"
                              >
                                <Send size={13} />
                                <span>{expired ? "Expired" : "Submit Work"}</span>
                              </button>
                            )}

                            {isPending && (
                              <button
                                type="button"
                                onClick={() => openSubmissionModal(asm)}
                                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#173854] hover:bg-[#F5ECE0]"
                              >
                                <span>Update</span>
                                <ArrowUpRight size={13} />
                              </button>
                            )}

                            {isGraded && (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100/80 px-3 py-1.5 text-xs font-bold text-emerald-800">
                                <CheckCircle2 size={13} /> Evaluated
                              </span>
                            )}

                            {canResubmit && (
                              <button
                                type="button"
                                onClick={() => openSubmissionModal(asm)}
                                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                              >
                                <span>Resubmit</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ==========================================================
          SUBMISSION MODAL (Creamy Glass)
      ========================================================== */}
      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal-enter w-full max-w-md overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                  <Send size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#16344E]">
                    {isUpdating
                      ? "Update Submission"
                      : getSubmission(selectedId)?.status === "Resubmission Required"
                      ? "Resubmit Assignment"
                      : "Submit Assignment"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide your repository and live demo links
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  GitHub Repository URL <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-username/repo"
                  className="h-11 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  className="h-11 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  value={liveDemoUrl}
                  onChange={(e) => setLiveDemoUrl(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                  Notes for Mentor
                </label>
                <textarea
                  placeholder="Add any context, credentials, or instructions for review..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] p-3 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#EBDCC8] pt-5 mt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-[#E5D7C4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="smooth-transition inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>
                    {submitting
                      ? "Saving..."
                      : isUpdating
                      ? "Update Links"
                      : "Submit Project"}
                  </span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==========================================================
          FEEDBACK MODAL
      ========================================================== */}
      {feedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={() => setFeedbackModal(null)}
        >
          <div className="modal-enter w-full max-w-md overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBDCC8] pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#E26D2C]">
                <MessageSquare size={16} />
                <span>Mentor Feedback & Notes</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-2xl border border-amber-300 bg-[#FEF3C7]/40 p-4 text-xs leading-relaxed text-amber-950 whitespace-pre-wrap">
              {feedbackModal}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setFeedbackModal(null)}
                className="rounded-xl bg-[#173854] px-5 py-2 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAssignment;