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
} from "lucide-react";

const Assignment = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // ============================================================
  // GET ASSIGNMENTS
  // ============================================================

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/assignments");
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error("GET ASSIGNMENTS ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET SUBMISSIONS FOR ASSIGNMENT
  // ============================================================

  const fetchSubmissions = async (assignmentId) => {
    try {
      setLoadingSubmissions(true);
      const response = await api.get(`/submissions/assignment/${assignmentId}`);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("GET SUBMISSIONS ERROR:", error);
      setSubmissions([]);
      toast.error(
        error.response?.data?.message || "Failed to load submissions."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ============================================================
  // SELECT ASSIGNMENT
  // ============================================================

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(null);
    setShowSubmissionModal(false);

    await fetchSubmissions(assignment._id);
  };

  // ============================================================
  // VIEW SUBMISSION
  // ============================================================

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  // ============================================================
  // CLOSE SUBMISSION MODAL
  // ============================================================

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedSubmission(null);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ============================================================
  // STATUS UI BADGES
  // ============================================================

  const getStatusBadge = (status) => {
    if (status === "Graded") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Graded
        </span>
      );
    }

    if (status === "Resubmission Required") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100/80 px-3 py-1 text-xs font-bold text-rose-800 shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          Resubmit Req.
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Review
      </span>
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">
            Loading Curriculum Assignments...
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
          MAIN GRADIENT CANVAS (Ice-Blue -> Cream -> Sunset Peach)
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
                      Curriculum Deliverables
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Assignments & Evaluations
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Review cohort project submissions, inspect source repositories, and provide evaluation grading.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-lg backdrop-blur-md">
                  <BookOpen size={16} className="text-[#F38744]" />
                  <span className="text-xs font-bold">
                    {assignments.length} Total Assignment{assignments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ======================================================
              2. ASSIGNMENTS DIRECTORY TABLE (Creamy Alabaster)
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            <div className="flex flex-col justify-between gap-4 border-b border-[#EBDCC8] px-6 py-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Published Assignments Roster
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select an assignment below to view its incoming student submissions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchAssignments}
                  className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-2 text-xs font-bold text-[#16344E] hover:bg-[#FFFDF9]"
                >
                  <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
                  <span>Refresh List</span>
                </button>
              </div>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center">
                <FileX className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">No assignments published</h3>
                <p className="mt-1 text-xs text-slate-500">
                  There are no active assignments available for review.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[950px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Assignment Detail
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Cohort Batch
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Lead Instructor
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Deadline Date
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Max Score
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Submissions Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignments.map((assignment) => {
                      const isSelected = selectedAssignment?._id === assignment._id;

                      return (
                        <tr
                          key={assignment._id}
                          className={`smooth-transition border-b border-[#EBDCC8] last:border-b-0 ${
                            isSelected
                              ? "bg-[#FDE2D2]/60 border-l-4 border-l-[#E26D2C]"
                              : "bg-[#FDF8F0]/75 hover:bg-[#EAE0D0]"
                          }`}
                        >
                          {/* ASSIGNMENT TITLE & DESC */}
                          <td className="px-6 py-4.5">
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-[#173854]">
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#16344E]">
                                  {assignment.title}
                                </p>
                                <p className="mt-0.5 max-w-xs truncate text-[11px] font-medium text-slate-500">
                                  {assignment.description || "No description provided"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* BATCH */}
                          <td className="px-5 py-4.5">
                            <span className="inline-flex rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2.5 py-1 text-xs font-bold text-[#173854]">
                              {assignment.batch?.name || "Current Batch"}
                            </span>
                          </td>

                          {/* INSTRUCTOR */}
                          <td className="px-5 py-4.5">
                            <span className="text-xs font-semibold text-slate-700">
                              {assignment.instructorName || "—"}
                            </span>
                          </td>

                          {/* DEADLINE */}
                          <td className="px-5 py-4.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Calendar size={14} className="text-[#E26D2C]" />
                              <span>{formatDate(assignment.deadline)}</span>
                            </div>
                          </td>

                          {/* MAX SCORE */}
                          <td className="px-5 py-4.5">
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBDCC8] bg-[#F5ECE0] px-2.5 py-1 text-xs font-black text-[#16344E]">
                              <Trophy size={13} className="text-[#E26D2C]" />
                              <span>{assignment.maxScore || 100} pts</span>
                            </div>
                          </td>

                          {/* ACTION BUTTON */}
                          <td className="px-6 py-4.5 text-right">
                            <button
                              onClick={() => handleSelectAssignment(assignment)}
                              className={`smooth-transition inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold shadow-sm hover:-translate-y-0.5 ${
                                isSelected
                                  ? "bg-[#173854] text-white"
                                  : "border border-[#DFCBB5] bg-[#FAF4EB] text-[#E26D2C] hover:border-[#E26D2C] hover:bg-[#FDE2D2]"
                              }`}
                            >
                              <Users size={14} />
                              <span>{isSelected ? "Active Selection" : "View Submissions"}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ======================================================
              3. SELECTED ASSIGNMENT / SUBMISSIONS PANEL
          ====================================================== */}
          {selectedAssignment && (
            <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
              {/* Top Details Bar */}
              <div className="border-b border-[#EBDCC8] bg-[#F5ECE0]/80 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#E26D2C]" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#E26D2C]">
                        Submissions Feed
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#16344E] mt-1">
                      {selectedAssignment.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Cohort: {selectedAssignment.batch?.name || "Active Batch"} • Max Points: {selectedAssignment.maxScore || 100}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-2xl border border-[#DFCBB5] bg-[#FFFDF9] px-4 py-2 text-xs font-black text-[#173854] shadow-sm">
                      {submissions.length} Total Submission{submissions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submissions Content */}
              {loadingSubmissions ? (
                <div className="flex min-h-60 flex-col items-center justify-center p-12">
                  <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Loading student submissions...
                  </p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileX className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                  <h3 className="mt-4 text-base font-black text-[#16344E]">
                    No Submissions Yet
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    No students have submitted this assignment for review.
                  </p>
                </div>
              ) : (
                <div className="hide-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Student Member
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Repository Link
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Live Deployment
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Date Logged
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Review Status
                        </th>
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Earned Score
                        </th>
                        <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {submissions.map((submission) => {
                        const student = submission.student;
                        const studentName = student
                          ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
                          : "Unknown Student";

                        return (
                          <tr
                            key={submission._id}
                            className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                          >
                            {/* STUDENT */}
                            <td className="px-6 py-4.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-xs font-black text-[#173854]">
                                  {student?.firstName?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-[#16344E]">
                                    {studentName}
                                  </p>
                                  <p className="text-[11px] font-medium text-slate-500">
                                    {student?.email || "No email"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* GITHUB */}
                            <td className="px-5 py-4.5">
                              {submission.githubUrl ? (
                                <a
                                  href={submission.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2.5 py-1 text-xs font-bold text-[#173854] hover:border-[#E26D2C]"
                                >
                                  <Code2 size={13} className="text-[#E26D2C]" />
                                  <span>Repository</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* LIVE DEMO */}
                            <td className="px-5 py-4.5">
                              {submission.liveDemoUrl ? (
                                <a
                                  href={submission.liveDemoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-[#E0F0FA] px-2.5 py-1 text-xs font-bold text-[#1E6FA3] hover:underline"
                                >
                                  <span>Live Demo</span>
                                  <ExternalLink size={10} />
                                </a>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>

                            {/* DATE */}
                            <td className="px-5 py-4.5 text-slate-600 font-semibold">
                              {formatDate(submission.createdAt)}
                            </td>

                            {/* STATUS */}
                            <td className="px-5 py-4.5">
                              {getStatusBadge(submission.status)}
                            </td>

                            {/* SCORE */}
                            <td className="px-5 py-4.5 font-black text-sm text-[#16344E]">
                              {submission.score !== null && submission.score !== undefined ? (
                                <span className="text-emerald-700">
                                  {submission.score}{" "}
                                  <span className="text-slate-400 text-xs font-normal">
                                    / {selectedAssignment.maxScore || 100}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-normal italic">
                                  Not graded
                                </span>
                              )}
                            </td>

                            {/* ACTION */}
                            <td className="px-6 py-4.5 text-right">
                              <button
                                onClick={() => handleViewSubmission(submission)}
                                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-3.5 py-1.5 text-xs font-bold text-[#E26D2C] shadow-sm hover:-translate-y-0.5 hover:border-[#E26D2C] hover:bg-[#FDE2D2]"
                              >
                                <Eye size={13} />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

        </div>
      </div>

      {/* ========================================================
          SUBMISSION DETAILS MODAL (Creamy Glass)
      ======================================================== */}
      {showSubmissionModal && selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSubmissionModal();
          }}
        >
          <div className="modal-enter flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Submission Review Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedSubmission.student?.firstName || "Student"} {selectedSubmission.student?.lastName || ""}
                  </p>
                </div>
              </div>

              <button
                onClick={closeSubmissionModal}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 sm:p-7 space-y-5">
              
              {/* STUDENT PROFILE STRIP */}
              <div className="flex items-center gap-4 rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-[#173854]">
                  <UserCircle size={28} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#16344E]">
                    {selectedSubmission.student?.firstName || ""} {selectedSubmission.student?.lastName || ""}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedSubmission.student?.email || "No email available"}
                  </p>
                </div>
              </div>

              {/* STATUS & SCORE DUAL PILL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Review Status
                  </p>
                  {getStatusBadge(selectedSubmission.status)}
                </div>

                <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/70 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Assigned Score
                  </p>
                  <p className="text-base font-black text-[#16344E]">
                    {selectedSubmission.score !== null && selectedSubmission.score !== undefined
                      ? `${selectedSubmission.score} / ${selectedAssignment?.maxScore || 100} pts`
                      : "Not graded yet"}
                  </p>
                </div>
              </div>

              {/* GITHUB LINK BOX */}
              <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  GitHub Code Repository
                </p>
                {selectedSubmission.githubUrl ? (
                  <a
                    href={selectedSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="smooth-transition flex items-center gap-2 rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] p-3 text-xs font-bold text-[#173854] hover:bg-[#E5D7C4] break-all"
                  >
                    <Code2 size={16} className="text-[#E26D2C] shrink-0" />
                    <span>{selectedSubmission.githubUrl}</span>
                    <ExternalLink size={12} className="shrink-0 ml-auto" />
                  </a>
                ) : (
                  <p className="text-xs text-slate-400">No GitHub repository provided.</p>
                )}
              </div>

              {/* LIVE DEMO LINK BOX */}
              <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Live Cloud Deployment URL
                </p>
                {selectedSubmission.liveDemoUrl ? (
                  <a
                    href={selectedSubmission.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="smooth-transition flex items-center gap-2 rounded-xl border border-blue-200 bg-[#E0F0FA] p-3 text-xs font-bold text-[#1E6FA3] hover:bg-[#D5EAF8] break-all"
                  >
                    <ExternalLink size={16} className="shrink-0" />
                    <span>{selectedSubmission.liveDemoUrl}</span>
                  </a>
                ) : (
                  <p className="text-xs text-slate-400">No live deployment provided.</p>
                )}
              </div>

              {/* STUDENT NOTES */}
              <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Student Notes & Comments
                </p>
                <div className="rounded-xl bg-[#F5ECE0]/60 p-3 text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedSubmission.notes || "No extra notes attached."}
                </div>
              </div>

              {/* MENTOR FEEDBACK */}
              {selectedSubmission.feedback && (
                <div className="rounded-2xl border border-amber-300 bg-[#FEF3C7]/40 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1.5">
                    Mentor Feedback & Evaluation
                  </p>
                  <div className="text-xs font-medium text-amber-950 leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.feedback}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-[#EBDCC8] bg-[#F5ECE0] p-4.5">
              <button
                type="button"
                onClick={closeSubmissionModal}
                className="rounded-xl bg-gradient-to-r from-[#173854] to-[#224A6D] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Assignment;